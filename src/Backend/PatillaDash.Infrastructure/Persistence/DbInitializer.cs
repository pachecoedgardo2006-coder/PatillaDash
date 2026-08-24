using Microsoft.EntityFrameworkCore;
using PatillaDash.Application.Interfaces;
using PatillaDash.Domain.Entities;
using PatillaDash.Domain.Enums;

namespace PatillaDash.Infrastructure.Persistence;

public static class DbInitializer
{
    public static async Task SeedAsync(PatillaDbContext context, IPasswordHasher passwordHasher)
    {
        // Aplica migraciones automáticamente si no existen
        await context.Database.MigrateAsync();

        // 1. Sembrar Locales
        if (!await context.Locales.AnyAsync())
        {
            var localCentro = new Local("Sede Centro", "Calle 45 # 12-34");
            var localNorte = new Local("Sede Norte", "Carrera 15 # 85-20");

            await context.Locales.AddRangeAsync(localCentro, localNorte);
            await context.SaveChangesAsync();
        }

        // 2. Sembrar Suministros
        if (!await context.Suministros.AnyAsync())
        {
            var suministros = new List<Suministro>
            {
                new("Patilla Entera", UnidadMedida.Unidades, 5),
                new("Vasos 16oz", UnidadMedida.Unidades, 50),
                new("Vasos 24oz", UnidadMedida.Unidades, 30),
                new("Tapas Domo", UnidadMedida.Unidades, 50),
                new("Bolsa de Hielo", UnidadMedida.Bolsas, 3),
                new("Azúcar (Kg)", UnidadMedida.Kilogramos, 5),
            };

            await context.Suministros.AddRangeAsync(suministros);
            await context.SaveChangesAsync();
        }

        // 3. Sembrar Inventario Inicial por Local
        if (!await context.Inventarios.AnyAsync())
        {
            var locales = await context.Locales.ToListAsync();
            var suministros = await context.Suministros.ToListAsync();

            var inventarios = new List<InventarioLocal>();
            foreach (var local in locales)
            {
                foreach (var sum in suministros)
                {
                    decimal cantidad = sum.Nombre.Contains("Patilla") ? 12 :
                                       sum.Nombre.Contains("Vasos") ? 100 :
                                       sum.Nombre.Contains("Tapas") ? 100 :
                                       sum.Nombre.Contains("Hielo") ? 8 : 15;

                    inventarios.Add(new InventarioLocal(local.Id, sum.Id, cantidad));
                }
            }

            await context.Inventarios.AddRangeAsync(inventarios);
            await context.SaveChangesAsync();
        }

        // 4. Sembrar Productos
        if (!await context.Productos.AnyAsync())
        {
            var productos = new List<Producto>
            {
                new("Patillazo Vaso 16oz", 5000, "Bebidas"),
                new("Patillazo Vaso 24oz", 7000, "Bebidas"),
                new("Patillazo Jarra Familiar", 18000, "Bebidas"),
                new("Refresco Artesanal", 4000, "Bebidas"),
            };

            await context.Productos.AddRangeAsync(productos);
            await context.SaveChangesAsync();
        }

        // 5. Sembrar Usuarios (Admin y Vendedor)
        if (!await context.Usuarios.AnyAsync())
        {
            var local1 = await context.Locales.FirstOrDefaultAsync();

            var adminHash = passwordHasher.HashPassword("Admin123!");
            var vendedorHash = passwordHasher.HashPassword("Vendedor123!");

            var admin = new Usuario(
                "Administrador Principal",
                "admin@patilladash.com",
                adminHash,
                RolUsuario.Administrador,
                null
            );

            var vendedor = new Usuario(
                "Carlos Vendedor",
                "carlos@patilladash.com",
                vendedorHash,
                RolUsuario.Vendedor,
                local1?.Id ?? 1
            );

            await context.Usuarios.AddRangeAsync(admin, vendedor);
            await context.SaveChangesAsync();
        }
    }
}
