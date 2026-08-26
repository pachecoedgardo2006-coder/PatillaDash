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
        // 0. En PostgreSQL / Supabase, si las tablas se crearon previamente con tipos antiguos de SQLite (integer para bool),
        // realizamos una limpieza previa segura del esquema para que las migraciones creen los tipos nativos correctos (boolean, numeric, timestamp).
        if (context.Database.IsNpgsql())
        {
            try
            {
                var conn = context.Database.GetDbConnection();
                if (conn.State != System.Data.ConnectionState.Open)
                {
                    await conn.OpenAsync();
                }

                using var checkCmd = conn.CreateCommand();
                checkCmd.CommandText = @"
                    SELECT data_type 
                    FROM information_schema.columns 
                    WHERE table_schema = 'public' 
                      AND table_name = 'Locales' 
                      AND column_name = 'Activo'
                    LIMIT 1;";
                var dataType = await checkCmd.ExecuteScalarAsync();

                if (dataType != null && dataType.ToString()?.Equals("integer", StringComparison.OrdinalIgnoreCase) == true)
                {
                    // Limpieza preventiva de tablas con tipos legacy
                    using var dropCmd = conn.CreateCommand();
                    dropCmd.CommandText = @"
                        DROP TABLE IF EXISTS ""ConsumosSuministroDiario"" CASCADE;
                        DROP TABLE IF EXISTS ""DetallesVentaDiaria"" CASCADE;
                        DROP TABLE IF EXISTS ""InventariosLocal"" CASCADE;
                        DROP TABLE IF EXISTS ""PagosEmpleado"" CASCADE;
                        DROP TABLE IF EXISTS ""ComprasInsumo"" CASCADE;
                        DROP TABLE IF EXISTS ""RegistrosVentaDiaria"" CASCADE;
                        DROP TABLE IF EXISTS ""Usuarios"" CASCADE;
                        DROP TABLE IF EXISTS ""Productos"" CASCADE;
                        DROP TABLE IF EXISTS ""Suministros"" CASCADE;
                        DROP TABLE IF EXISTS ""Locales"" CASCADE;
                        DROP TABLE IF EXISTS ""__EFMigrationsHistory"" CASCADE;";
                    await dropCmd.ExecuteNonQueryAsync();
                }
            }
            catch
            {
                // Silencioso si la conexión o tablas no existen aún
            }
        }

        // 1. Ejecutar migraciones con tipos nativos tanto en SQLite (local) como en PostgreSQL (Supabase / Render)
        try
        {
            await context.Database.MigrateAsync();
        }
        catch
        {
            try
            {
                var databaseCreator = (RelationalDatabaseCreator)context.Database.GetService<IDatabaseCreator>();
                await databaseCreator.CreateTablesAsync();
            }
            catch
            {
                // Si las tablas de PatillaDash ya existen, continuar a la siembra
            }
        }

        // 2. Sembrar Locales Reales (Puntos de Venta)
        if (!await context.Locales.AnyAsync())
        {
            var punto30 = new Local("Punto de la 30", "Calle 30");
            var punto27 = new Local("Punto de la 27", "Calle 27");

            await context.Locales.AddRangeAsync(punto30, punto27);
            await context.SaveChangesAsync();
        }

        // 3. Sembrar Insumos / Suministros Reales
        if (!await context.Suministros.AnyAsync())
        {
            var suministros = new List<Suministro>
            {
                new("Patillas", UnidadMedida.Unidades, 10),
                new("Vasos 9 Oz", UnidadMedida.Unidades, 50),
                new("Vasos 14 oz", UnidadMedida.Unidades, 25),
                new("Vasos 7 oz", UnidadMedida.Unidades, 50),
                new("Deditos (Insumo)", UnidadMedida.Unidades, 20),
                new("Pastelitos (Insumo)", UnidadMedida.Unidades, 20),
                new("Bolsa de basura", UnidadMedida.Bolsas, 5),
                new("Bolsa de frito", UnidadMedida.Bolsas, 10),
                new("Azúcar", UnidadMedida.Kilogramos, 5),
                new("Cucharas", UnidadMedida.Unidades, 50),
                new("Servilletas", UnidadMedida.Unidades, 100),
                new("Galletas (Insumo)", UnidadMedida.Unidades, 30),
                new("Limones", UnidadMedida.Unidades, 20),
            };

            await context.Suministros.AddRangeAsync(suministros);
            await context.SaveChangesAsync();
        }

        // 4. Sembrar Inventario Base por Local
        if (!await context.Inventarios.AnyAsync())
        {
            var locales = await context.Locales.ToListAsync();
            var suministros = await context.Suministros.ToListAsync();

            var inventarios = new List<InventarioLocal>();
            foreach (var local in locales)
            {
                foreach (var sum in suministros)
                {
                    decimal cantidad = sum.Nombre switch
                    {
                        "Patillas" => 15,
                        "Vasos 9 Oz" => 50,
                        "Vasos 14 oz" => 25,
                        "Vasos 7 oz" => 50,
                        "Deditos (Insumo)" => 30,
                        "Pastelitos (Insumo)" => 30,
                        "Bolsa de basura" => 10,
                        "Bolsa de frito" => 20,
                        "Azúcar" => 10,
                        "Cucharas" => 100,
                        "Servilletas" => 200,
                        "Galletas (Insumo)" => 40,
                        "Limones" => 50,
                        _ => 20
                    };

                    inventarios.Add(new InventarioLocal(local.Id, sum.Id, cantidad));
                }
            }

            await context.Inventarios.AddRangeAsync(inventarios);
            await context.SaveChangesAsync();
        }

        // 5. Sembrar Productos de Venta Reales y Precios Exactos
        if (!await context.Productos.AnyAsync())
        {
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
        }

        // 6. Sembrar Usuarios (Admin y Vendedoras Reales)
        if (!await context.Usuarios.AnyAsync())
        {
            var punto30 = await context.Locales.FirstOrDefaultAsync(l => l.Nombre == "Punto de la 30");
            var punto27 = await context.Locales.FirstOrDefaultAsync(l => l.Nombre == "Punto de la 27");

            var adminHash = passwordHasher.HashPassword("Admin123!");
            var vendedorHash = passwordHasher.HashPassword("Vendedor123!");

            var admin = new Usuario(
                "Administrador Principal",
                "admin@patilladash.com",
                adminHash,
                RolUsuario.Administrador,
                null
            );

            var maricela = new Usuario(
                "Maricela Montenegro",
                "maricela@patilladash.com",
                vendedorHash,
                RolUsuario.Vendedor,
                punto30?.Id ?? 1
            );

            var yenirbeth = new Usuario(
                "Yenirbeth Yadelin",
                "yenirbeth@patilladash.com",
                vendedorHash,
                RolUsuario.Vendedor,
                punto27?.Id ?? 2
            );

            await context.Usuarios.AddRangeAsync(admin, maricela, yenirbeth);
            await context.SaveChangesAsync();
        }
    }
}
