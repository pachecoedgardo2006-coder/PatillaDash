using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PatillaDash.Application.Interfaces;
using PatillaDash.Domain.Interfaces;
using PatillaDash.Infrastructure.Auth;
using PatillaDash.Infrastructure.Persistence;
using PatillaDash.Infrastructure.Repositories;

namespace PatillaDash.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // 1. Obtención de cadena de conexión (Variable de entorno de Render/Supabase o appsettings)
        var rawConnection = Environment.GetEnvironmentVariable("DATABASE_URL")
            ?? configuration.GetConnectionString("DefaultConnection")
            ?? "Data Source=patilladash.db";

        // Si contiene el placeholder de plantilla de producción de appsettings.Production.json, usar SQLite local
        if (rawConnection.Contains("your-supabase-project", StringComparison.OrdinalIgnoreCase))
        {
            rawConnection = "Data Source=patilladash.db";
        }

        var provider = configuration["DatabaseProvider"]?.ToLowerInvariant();

        // 2. Detección inteligente de PostgreSQL (Supabase / Render / Cloud) vs SQLite (Local)
        bool isPostgres = !rawConnection.StartsWith("Data Source=", StringComparison.OrdinalIgnoreCase) &&
                         (provider == "postgres" ||
                          provider == "postgresql" ||
                          provider == "supabase" ||
                          rawConnection.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
                          rawConnection.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase) ||
                          rawConnection.Contains("Host=", StringComparison.OrdinalIgnoreCase) ||
                          rawConnection.Contains("Server=", StringComparison.OrdinalIgnoreCase) ||
                          rawConnection.Contains("User Id=", StringComparison.OrdinalIgnoreCase) ||
                          rawConnection.Contains("Username=", StringComparison.OrdinalIgnoreCase));

        if (isPostgres)
        {
            var npgsqlConnectionString = ParsePostgreSqlConnectionString(rawConnection);
            services.AddDbContext<PatillaDbContext>(options =>
            {
                options.ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning));
                options.UseNpgsql(npgsqlConnectionString, npgsqlOptions =>
                {
                    npgsqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 5,
                        maxRetryDelay: TimeSpan.FromSeconds(10),
                        errorCodesToAdd: null);
                });
            });
        }
        else
        {
            // Entorno Local / SQLite por defecto
            services.AddDbContext<PatillaDbContext>(options =>
            {
                options.ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning));
                options.UseSqlite(rawConnection);
            });
        }

        // Repositorios
        services.AddScoped<IUsuarioRepository, UsuarioRepository>();
        services.AddScoped<ILocalRepository, LocalRepository>();
        services.AddScoped<ISuministroRepository, SuministroRepository>();
        services.AddScoped<IInventarioRepository, InventarioRepository>();
        services.AddScoped<IVentaRepository, VentaRepository>();
        services.AddScoped<IPagoEmpleadoRepository, PagoEmpleadoRepository>();
        services.AddScoped<ICompraRepository, CompraRepository>();
        services.AddScoped<IProductoRepository, ProductoRepository>();

        // Servicios de Seguridad y Token
        services.AddSingleton<IPasswordHasher, PasswordHasher>();
        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();

        return services;
    }

    /// <summary>
    /// Normaliza cualquier formato de conexión de Supabase / PostgreSQL (URI postgres:// o ADO.NET Server=...)
    /// asegurando SSL y compatibilidad total con Npgsql.
    /// </summary>
    private static string ParsePostgreSqlConnectionString(string raw)
    {
        if (raw.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
            raw.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            try
            {
                var uri = new Uri(raw);
                var userInfo = uri.UserInfo.Split(':');
                var username = userInfo.Length > 0 ? Uri.UnescapeDataString(userInfo[0]) : "";
                var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
                var host = uri.Host;
                var port = uri.Port > 0 ? uri.Port : 5432;
                var database = uri.AbsolutePath.TrimStart('/');

                return $"Host={host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true;";
            }
            catch
            {
                return raw;
            }
        }

        // Si ya viene formateada en formato ADO.NET (Server=... o Host=...)
        var conn = raw.Trim();
        if (!conn.Contains("SSL Mode=", StringComparison.OrdinalIgnoreCase))
        {
            conn = conn.TrimEnd(';') + ";SSL Mode=Require;Trust Server Certificate=true;";
        }
        return conn;
    }
}
