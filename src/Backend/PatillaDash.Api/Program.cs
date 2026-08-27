using System.Text;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
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

// Ocultar cabeceras de servidor para prevenir fingerprinting
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.AddServerHeader = false;
});

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
        ClockSkew = TimeSpan.FromMinutes(5)
    };
});

builder.Services.AddAuthorization();

// Rate Limiting para mitigar ataques de fuerza bruta en credenciales
builder.Services.AddRateLimiter(rateLimiterOptions =>
{
    rateLimiterOptions.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    rateLimiterOptions.AddFixedWindowLimiter("loginLimiter", options =>
    {
        options.PermitLimit = 10;
        options.Window = TimeSpan.FromMinutes(1);
        options.QueueLimit = 0;
    });
});

// Política CORS segura y blindada contra orígenes desconocidos
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
            // Permite únicamente el frontend de producción en Netlify, sus previsualizaciones, localhost y red local
            policy.SetIsOriginAllowed(origin =>
            {
                if (string.IsNullOrEmpty(origin)) return false;
                if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri)) return false;

                // Permitir dominios oficiales y previsualizaciones en Netlify y Vercel
                if (uri.Host.Equals("patilladash.netlify.app", StringComparison.OrdinalIgnoreCase) ||
                    uri.Host.EndsWith(".netlify.app", StringComparison.OrdinalIgnoreCase) ||
                    uri.Host.EndsWith(".vercel.app", StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }

                if (uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase) ||
                    uri.Host.Equals("127.0.0.1", StringComparison.OrdinalIgnoreCase) ||
                    uri.Host.StartsWith("192.168.", StringComparison.OrdinalIgnoreCase) ||
                    uri.Host.StartsWith("10.", StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }

                return false;
            })
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

// Headers de Seguridad HTTP contra sniffing, clickjacking y downgrade de referrers
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
    await next();
});

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

app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
