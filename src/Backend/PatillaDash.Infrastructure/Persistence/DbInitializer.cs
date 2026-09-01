using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using PatillaDash.Application.Interfaces;
using PatillaDash.Domain.Entities;
using PatillaDash.Domain.Enums;

namespace PatillaDash.Infrastructure.Persistence;

public static class DbInitializer
{
    public static async Task SeedAsync(PatillaDbContext context, IPasswordHasher passwordHasher)
    {
        // 1. Ejecutar migraciones o creación de tablas
        try
        {
            await context.Database.MigrateAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DbInitializer] MigrateAsync: {ex.Message}. Intentando CreateTablesAsync()...");
            try
            {
                var databaseCreator = (RelationalDatabaseCreator)context.Database.GetService<IDatabaseCreator>();
                await databaseCreator.CreateTablesAsync();
            }
            catch (Exception ex2)
            {
                Console.WriteLine($"[DbInitializer] Fallo fallback CreateTablesAsync: {ex2.Message}");
            }
        }

        // 1.1 Limpieza y reinicio estructural seguro para sincronización total desde cero
        try
        {
            if (context.Database.IsNpgsql())
            {
                await context.Database.ExecuteSqlRawAsync(@"
                    TRUNCATE TABLE ""ConsumosSuministroDiario"", ""DetallesVentaDiaria"", ""RegistrosVentaDiaria"", ""ComprasInsumo"", ""PagosEmpleado"", ""InventariosLocal"", ""Productos"", ""Suministros"", ""Locales"" CASCADE;
                ");
            }
            else
            {
                context.ConsumosSuministro.RemoveRange(context.ConsumosSuministro);
                context.DetallesVenta.RemoveRange(context.DetallesVenta);
                context.Ventas.RemoveRange(context.Ventas);
                context.ComprasInsumo.RemoveRange(context.ComprasInsumo);
                context.PagosEmpleado.RemoveRange(context.PagosEmpleado);
                context.Inventarios.RemoveRange(context.Inventarios);
                context.Productos.RemoveRange(context.Productos);
                context.Suministros.RemoveRange(context.Suministros);
                context.Locales.RemoveRange(context.Locales);
                await context.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DbInitializer] Nota de limpieza inicial: {ex.Message}");
        }

        // 2. Sembrar Locales Reales
        var punto30 = new Local("Punto de la 30", "Calle 30");
        var punto27 = new Local("Punto de la 27", "Calle 27");

        await context.Locales.AddRangeAsync(punto30, punto27);
        await context.SaveChangesAsync();

        // 3. Sembrar Insumos / Suministros Reales con Alertas Nuevas
        var suministros = new List<Suministro>
        {
            new("Patillas", UnidadMedida.Unidades, 5),
            new("Vasos 9 Oz", UnidadMedida.Unidades, 50),
            new("Vasos 14 oz", UnidadMedida.Unidades, 25),
            new("Vasos 7 oz", UnidadMedida.Unidades, 50),
            new("Deditos (Insumo)", UnidadMedida.Unidades, 10),
            new("Pastelitos (Insumo)", UnidadMedida.Unidades, 10),
            new("Bolsa de basura", UnidadMedida.Paquetes, 1),
            new("Bolsa de frito", UnidadMedida.Paquetes, 1),
            new("Azúcar", UnidadMedida.Kilogramos, 2),
            new("Cucharas", UnidadMedida.Unidades, 50),
            new("Servilletas", UnidadMedida.Unidades, 100),
            new("Galletas (Insumo)", UnidadMedida.Unidades, 30),
            new("Limones", UnidadMedida.Unidades, 20),
        };

        await context.Suministros.AddRangeAsync(suministros);
        await context.SaveChangesAsync();

        // 4. Sembrar Inventario Base por Local
        var locales = await context.Locales.ToListAsync();
        var listaSuministros = await context.Suministros.ToListAsync();

        var inventarios = new List<InventarioLocal>();
        foreach (var loc in locales)
        {
            foreach (var sum in listaSuministros)
            {
                decimal cantidad = sum.Nombre switch
                {
                    "Patillas" => 15,
                    "Vasos 9 Oz" => 50,
                    "Vasos 14 oz" => 25,
                    "Vasos 7 oz" => 50,
                    "Deditos (Insumo)" => 30,
                    "Pastelitos (Insumo)" => 30,
                    "Bolsa de basura" => 5,
                    "Bolsa de frito" => 10,
                    "Azúcar" => 10,
                    "Cucharas" => 100,
                    "Servilletas" => 200,
                    "Galletas (Insumo)" => 40,
                    "Limones" => 50,
                    _ => 20
                };

                inventarios.Add(new InventarioLocal(loc.Id, sum.Id, cantidad));
            }
        }

        await context.Inventarios.AddRangeAsync(inventarios);
        await context.SaveChangesAsync();

        // 5. Sembrar Productos Oficiales y Precios Exactos
        var productos = new List<Producto>
        {
            new("Galletas el pedazo", 1000, "Snacks", true),
            new("Vaso 7oz", 2000, "Bebidas", true),
            new("Vaso 9oz", 3000, "Bebidas", true),
            new("Vaso 14oz", 5000, "Bebidas", true),
            new("Deditos", 2500, "Fritos", true),
            new("Pastelitos", 3000, "Fritos", true),
        };

        await context.Productos.AddRangeAsync(productos);
        await context.SaveChangesAsync();

        // 6. Sembrar / Sincronizar Exactamente los 4 Usuarios Oficiales
        var adminHash = passwordHasher.HashPassword("Admin123!");
        var vendedorHash = passwordHasher.HashPassword("Vendedor123!");

        // 6.1 empe (Administrador)
        var empe = await context.Usuarios.FirstOrDefaultAsync(u => u.Email == "empe@patilladash.com");
        if (empe == null)
        {
            empe = new Usuario("empe", "empe@patilladash.com", adminHash, RolUsuario.Administrador, null);
            await context.Usuarios.AddAsync(empe);
        }
        else
        {
            empe.ActualizarPassword(adminHash);
        }

        // 6.2 Administrador Principal (Administrador)
        var admin = await context.Usuarios.FirstOrDefaultAsync(u => u.Email == "admin@patilladash.com");
        if (admin == null)
        {
            admin = new Usuario("Administrador Principal", "admin@patilladash.com", adminHash, RolUsuario.Administrador, null);
            await context.Usuarios.AddAsync(admin);
        }
        else
        {
            admin.ActualizarPassword(adminHash);
        }

        // 6.3 Maricela Montenegro (Vendedora Punto de la 30)
        var maricela = await context.Usuarios.FirstOrDefaultAsync(u => u.Email == "maricela@patilladash.com");
        if (maricela == null)
        {
            maricela = new Usuario("Maricela Montenegro", "maricela@patilladash.com", vendedorHash, RolUsuario.Vendedor, punto30.Id);
            await context.Usuarios.AddAsync(maricela);
        }
        else
        {
            maricela.ActualizarPassword(vendedorHash);
        }

        // 6.4 Yenirbeth Yadelin (Vendedora Punto de la 27)
        var yenirbeth = await context.Usuarios.FirstOrDefaultAsync(u => u.Email == "yenirbeth@patilladash.com");
        if (yenirbeth == null)
        {
            yenirbeth = new Usuario("Yenirbeth Yadelin", "yenirbeth@patilladash.com", vendedorHash, RolUsuario.Vendedor, punto27.Id);
            await context.Usuarios.AddAsync(yenirbeth);
        }
        else
        {
            yenirbeth.ActualizarPassword(vendedorHash);
        }

        await context.SaveChangesAsync();
    }
}
