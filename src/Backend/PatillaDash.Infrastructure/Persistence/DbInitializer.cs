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
                        IF EXISTS (\n                            SELECT 1 FROM information_schema.columns 
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

        // 3. Sembrar Insumos / Suministros Reales y Actualizar Alertas
        if (!await context.Suministros.AnyAsync())
        {
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
        }
        else
        {
            // Sincronizar alertas y unidades actualizadas en BD existente
            var existSuministros = await context.Suministros.ToListAsync();
            foreach (var sum in existSuministros)
            {
                var n = sum.Nombre.ToLower();
                if (n.Contains("patilla"))
                {
                    sum.ActualizarStockMinimo(5);
                    sum.ActualizarUnidadMedida(UnidadMedida.Unidades);
                }
                else if (n.Contains("dedito"))
                {
                    sum.ActualizarStockMinimo(10);
                    sum.ActualizarUnidadMedida(UnidadMedida.Unidades);
                }
                else if (n.Contains("pastelito"))
                {
                    sum.ActualizarStockMinimo(10);
                    sum.ActualizarUnidadMedida(UnidadMedida.Unidades);
                }
                else if (n.Contains("bolsa de basura"))
                {
                    sum.ActualizarStockMinimo(1);
                    sum.ActualizarUnidadMedida(UnidadMedida.Paquetes);
                }
                else if (n.Contains("bolsa de frito"))
                {
                    sum.ActualizarStockMinimo(1);
                    sum.ActualizarUnidadMedida(UnidadMedida.Paquetes);
                }
                else if (n.Contains("azúcar") || n.Contains("azucar"))
                {
                    sum.ActualizarStockMinimo(2);
                    sum.ActualizarUnidadMedida(UnidadMedida.Kilogramos);
                }
            }
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
                        "Bolsa de basura" => 5,
                        "Bolsa de frito" => 10,
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

        // 6. Sembrar o Sincronizar Usuarios (Admin y Vendedoras Reales)
        var local30 = await context.Locales.FirstOrDefaultAsync(l => l.Nombre == "Punto de la 30") ?? await context.Locales.FirstOrDefaultAsync();
        var local27 = await context.Locales.FirstOrDefaultAsync(l => l.Nombre == "Punto de la 27") ?? await context.Locales.OrderByDescending(l => l.Id).FirstOrDefaultAsync();

        var adminHash = passwordHasher.HashPassword("Admin123!");
        var vendedorHash = passwordHasher.HashPassword("Vendedor123!");

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

        var maricela = await context.Usuarios.FirstOrDefaultAsync(u => u.Email == "maricela@patilladash.com");
        if (maricela == null)
        {
            maricela = new Usuario("Maricela Montenegro", "maricela@patilladash.com", vendedorHash, RolUsuario.Vendedor, local30?.Id ?? 1);
            await context.Usuarios.AddAsync(maricela);
        }
        else
        {
            maricela.ActualizarPassword(vendedorHash);
        }

        var yenirbeth = await context.Usuarios.FirstOrDefaultAsync(u => u.Email == "yenirbeth@patilladash.com");
        if (yenirbeth == null)
        {
            yenirbeth = new Usuario("Yenirbeth Yadelin", "yenirbeth@patilladash.com", vendedorHash, RolUsuario.Vendedor, local27?.Id ?? 2);
            await context.Usuarios.AddAsync(yenirbeth);
        }
        else
        {
            yenirbeth.ActualizarPassword(vendedorHash);
        }

        await context.SaveChangesAsync();
    }
}
