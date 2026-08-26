using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using PatillaDash.Application.Interfaces;
using PatillaDash.Application.Services;

namespace PatillaDash.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IVentaService, VentaService>();
        services.AddScoped<IInventarioService, InventarioService>();
        services.AddScoped<ICompraService, CompraService>();
        services.AddScoped<IPagoEmpleadoService, PagoEmpleadoService>();
        services.AddScoped<IEstadisticasService, EstadisticasService>();
        services.AddScoped<IProductoService, ProductoService>();

        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        return services;
    }
}
