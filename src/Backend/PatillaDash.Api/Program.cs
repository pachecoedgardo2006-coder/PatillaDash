using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using PatillaDash.Api.Filters;
using PatillaDash.Api.Middleware;
using PatillaDash.Application;
using PatillaDash.Application.Interfaces;
using PatillaDash.Infrastructure;
using PatillaDash.Infrastructure.Persistence;
using Scalar.AspNetCore;

// Optimización crítica para contenedores Linux / Render (Evita error IOException: inotify instances limit alcanzado)
Environment.SetEnvironmentVariable("DOTNET_USE_POLLING_FILE_WATCHER", "true");
Environment.SetEnvironmentVariable("DOTNET_EnableDiagnostics", "0");
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

// Soporte dinámico de Puerto para Cloud / Render (variable de entorno PORT)
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(port))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

// Inyección de dependencias de Capas
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// Autenticación JWT Bearer con prioridad a variable de entorno JWT_SECRET_KEY
var jwtSecretKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY")
    ?? builder.Configuration["Jwt:SecretKey"]
    ?? "PatillaDashSecretKey_ParaAutenticacionSeguraJWT_2026!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "PatillaDashApi";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "PatillaDashClient";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// Política CORS flexible para desarrollo local y producción en Netlify
var allowedOriginsEnv = Environment.GetEnvironmentVariable("CORS_ALLOWED_ORIGINS");
var customOrigins = allowedOriginsEnv?.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries) ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        if (customOrigins.Length > 0)
        {
            policy.WithOrigins(customOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
        else
        {
            // Permite conexiones locales y subdominios de Netlify en desarrollo/staging
            policy.SetIsOriginAllowed(_ => true)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
    });
});

// Manejo Global de Excepciones y ProblemDetails (RFC 7807)
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

// Controladores con Filtro de Validación FluentValidation y soporte Enums en JSON
builder.Services.AddControllers(options =>
{
    options.Filters.Add<ValidationFilter>();
})
.AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

// OpenAPI & Documentación
builder.Services.AddOpenApi();

var app = builder.Build();

// Inicializar y sembrar Base de Datos automáticamente (Postgres o SQLite)
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<PatillaDbContext>();
        var passwordHasher = services.GetRequiredService<IPasswordHasher>();
        await DbInitializer.SeedAsync(context, passwordHasher);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Ocurrió un error al sembrar la base de datos.");
    }
}

// Pipeline de manejo de errores
app.UseExceptionHandler();

// Endpoint de Health Check para Render / Uptime monitors (Soporta GET y HEAD)
var healthMethods = new[] { "GET", "HEAD" };
app.MapMethods("/health", healthMethods, () => Results.Ok(new { status = "Healthy", timestamp = DateTime.UtcNow, app = "PatillaDash API" }));
app.MapMethods("/api/health", healthMethods, () => Results.Ok(new { status = "Healthy", timestamp = DateTime.UtcNow, app = "PatillaDash API" }));

// Documentación de API interactiva (Scalar)
var enableDocs = app.Environment.IsDevelopment() || app.Configuration.GetValue<bool>("EnableOpenApi");
if (enableDocs)
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.WithTitle("PatillaDash API Docs")
               .WithTheme(ScalarTheme.Purple)
               .WithDefaultHttpClient(ScalarTarget.JavaScript, ScalarClient.Axios);
    });
}

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
