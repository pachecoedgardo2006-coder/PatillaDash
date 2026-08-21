using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using PatillaDash.Api.Filters;
using PatillaDash.Api.Middleware;
using PatillaDash.Application;
using PatillaDash.Infrastructure;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Inyección de dependencias de Capas
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// Autenticación JWT Bearer
var jwtSecretKey = builder.Configuration["Jwt:SecretKey"] 
    ?? throw new InvalidOperationException("La clave secreta de JWT no está configurada.");
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

// Política CORS para Vite SPA
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Manejo Global de Excepciones y ProblemDetails (RFC 7807)
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

// Controladores con Filtro de Validación FluentValidation
builder.Services.AddControllers(options =>
{
    options.Filters.Add<ValidationFilter>();
});

// OpenAPI & Scalar
builder.Services.AddOpenApi();

var app = builder.Build();

// Pipeline de manejo de errores
app.UseExceptionHandler();

// Documentación de API interactiva en desarrollo
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
