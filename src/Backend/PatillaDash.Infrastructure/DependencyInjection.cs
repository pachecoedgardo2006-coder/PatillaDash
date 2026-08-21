using Microsoft.EntityFrameworkCore;
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
        var connectionString = configuration.GetConnectionString("DefaultConnection") ?? "Data Source=patilladash.db";

        services.AddDbContext<PatillaDbContext>(options =>
            options.UseSqlite(connectionString));

        // Repositorios
        services.AddScoped<IUsuarioRepository, UsuarioRepository>();
        services.AddScoped<ILocalRepository, LocalRepository>();
        services.AddScoped<ISuministroRepository, SuministroRepository>();
        services.AddScoped<IInventarioRepository, InventarioRepository>();
        services.AddScoped<IVentaRepository, VentaRepository>();
        services.AddScoped<IPagoEmpleadoRepository, PagoEmpleadoRepository>();
        services.AddScoped<ICompraRepository, CompraRepository>();

        // Servicios de Seguridad y Token
        services.AddSingleton<IPasswordHasher, PasswordHasher>();
        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();

        return services;
    }
}
