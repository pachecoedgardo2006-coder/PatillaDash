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
        // 1. Ejecutar migraciones con tipos nativos tanto en SQLite (local) como en PostgreSQL (Supabase / Render)
        try
        {
            await context.Database.MigrateAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DbInitializer] MigrateAsync fallo: {ex.Message}. Intentando CreateTablesAsync()...");
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

        // 1.1 Seguridad preventiva adicional: asegurar que Id autoincremente y Activo sea boolean
        if (context.Database.IsNpgsql())
        {
            try
            {
                await context.Database.ExecuteSqlRawAsync(@"
                    DO $$ 
                    DECLARE
                        tbl text;
                        seq_name text;
                    BEGIN
                        -- 1. Asegurar tipos boolean
                        IF EXISTS (
                            SELECT 1 FROM information_schema.columns 
                            WHERE LOWER(table_name) = 'locales' 
                              AND LOWER(column_name) = 'activo' 
                              AND data_type IN ('integer', 'smallint', 'bigint', 'numeric')
                        ) THEN
                            EXECUTE 'ALTER TABLE ""Locales"" ALTER COLUMN ""Activo"" TYPE boolean USING (""Activo""::text = ''1'' OR ""Activo""::text = ''true'')';
                        END IF;

                        IF EXISTS (
                            SELECT 1 FROM information_schema.columns 
                            WHERE LOWER(table_name) = 'productos' 
                              AND LOWER(column_name) = 'activo' 
                              AND data_type IN ('integer', 'smallint', 'bigint', 'numeric')
                        ) THEN
                            EXECUTE 'ALTER TABLE ""Productos"" ALTER COLUMN ""Activo"" TYPE boolean USING (""Activo""::text = ''1'' OR ""Activo""::text = ''true'')';
                        END IF;

                        -- 2. Asegurar autoincremento en Id para todas las tablas si no son identity
                        FOR tbl IN SELECT unnest(ARRAY['Locales', 'Productos', 'Suministros', 'Usuarios', 'ComprasInsumo', 'InventariosLocal', 'PagosEmpleado', 'RegistrosVentaDiaria', 'ConsumosSuministroDiario', 'DetallesVentaDiaria'])
                        LOOP
                            IF EXISTS (
                                SELECT 1 FROM information_schema.columns 
                                WHERE (table_name = tbl OR LOWER(table_name) = LOWER(tbl))
                                  AND LOWER(column_name) = 'id' 
                                  AND is_identity = 'NO' 
                                  AND column_default IS NULL
                            ) THEN
                                seq_name := lower(tbl) || '_id_manual_seq';
                                EXECUTE format('CREATE SEQUENCE IF NOT EXISTS %I', seq_name);
                                EXECUTE format('ALTER TABLE %I ALTER COLUMN ""Id"" SET DEFAULT nextval(%L)', tbl, seq_name);
                                EXECUTE format('ALTER SEQUENCE %I OWNED BY %I.""Id""', seq_name, tbl);
                                EXECUTE format('SELECT setval(%L, COALESCE((SELECT MAX(""Id"") FROM %I), 0) + 1, false)', seq_name, tbl);
                            END IF;
                        END LOOP;
                    END $$;
                ");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DbInitializer] Ajuste final de esquemas en PostgreSQL: {ex.Message}");
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

        // 6. Sembrar Usuarios Iniciales (Admin y Vendedores Demo)
        if (!await context.Usuarios.AnyAsync())
        {
            var local1 = await context.Locales.FirstOrDefaultAsync();
            var local2 = await context.Locales.OrderByDescending(l => l.Id).FirstOrDefaultAsync();

            var adminPassword = Environment.GetEnvironmentVariable("SEED_ADMIN_PASSWORD") ?? "AdminDemo2026!";
            var vendedorPassword = Environment.GetEnvironmentVariable("SEED_VENDEDOR_PASSWORD") ?? "VendedorDemo2026!";

            var adminHash = passwordHasher.HashPassword(adminPassword);
            var vendedorHash = passwordHasher.HashPassword(vendedorPassword);

            var admin = new Usuario(
                "Administrador Principal",
                "admin@patilladash.com",
                adminHash,
                RolUsuario.Administrador,
                null
            );

            var vendedor1 = new Usuario(
                "Vendedor Sede 1",
                "vendedor1@patilladash.com",
                vendedorHash,
                RolUsuario.Vendedor,
                local1?.Id ?? 1
            );

            var vendedor2 = new Usuario(
                "Vendedor Sede 2",
                "vendedor2@patilladash.com",
                vendedorHash,
                RolUsuario.Vendedor,
                local2?.Id ?? 2
            );

            await context.Usuarios.AddRangeAsync(admin, vendedor1, vendedor2);
            await context.SaveChangesAsync();
        }
    }
}
