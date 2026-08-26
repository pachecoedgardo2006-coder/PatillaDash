using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PatillaDash.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Locales",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Nombre = table.Column<string>(maxLength: 100, nullable: false),
                    Direccion = table.Column<string>(maxLength: 250, nullable: false),
                    Activo = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Locales", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Productos",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Nombre = table.Column<string>(maxLength: 100, nullable: false),
                    PrecioBase = table.Column<decimal>(precision: 18, scale: 2, nullable: false),
                    Categoria = table.Column<string>(maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Productos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Suministros",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Nombre = table.Column<string>(maxLength: 100, nullable: false),
                    UnidadMedida = table.Column<string>(maxLength: 50, nullable: false),
                    StockMinimoAlerta = table.Column<decimal>(precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Suministros", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Nombre = table.Column<string>(maxLength: 100, nullable: false),
                    Email = table.Column<string>(maxLength: 150, nullable: false),
                    PasswordHash = table.Column<string>(maxLength: 256, nullable: false),
                    Rol = table.Column<string>(maxLength: 50, nullable: false),
                    LocalId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Usuarios_Locales_LocalId",
                        column: x => x.LocalId,
                        principalTable: "Locales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ComprasInsumo",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    LocalId = table.Column<int>(nullable: false),
                    SuministroId = table.Column<int>(nullable: false),
                    Cantidad = table.Column<decimal>(precision: 18, scale: 2, nullable: false),
                    CostoTotal = table.Column<decimal>(precision: 18, scale: 2, nullable: false),
                    Fecha = table.Column<DateTime>(nullable: false),
                    Proveedor = table.Column<string>(maxLength: 150, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ComprasInsumo", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ComprasInsumo_Locales_LocalId",
                        column: x => x.LocalId,
                        principalTable: "Locales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ComprasInsumo_Suministros_SuministroId",
                        column: x => x.SuministroId,
                        principalTable: "Suministros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "InventariosLocal",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    LocalId = table.Column<int>(nullable: false),
                    SuministroId = table.Column<int>(nullable: false),
                    CantidadDisponible = table.Column<decimal>(precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventariosLocal", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InventariosLocal_Locales_LocalId",
                        column: x => x.LocalId,
                        principalTable: "Locales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InventariosLocal_Suministros_SuministroId",
                        column: x => x.SuministroId,
                        principalTable: "Suministros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PagosEmpleado",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    LocalId = table.Column<int>(nullable: false),
                    VendedorId = table.Column<int>(nullable: false),
                    Monto = table.Column<decimal>(precision: 18, scale: 2, nullable: false),
                    FechaPago = table.Column<DateTime>(nullable: false),
                    Observacion = table.Column<string>(maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PagosEmpleado", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PagosEmpleado_Locales_LocalId",
                        column: x => x.LocalId,
                        principalTable: "Locales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PagosEmpleado_Usuarios_VendedorId",
                        column: x => x.VendedorId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RegistrosVentaDiaria",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    LocalId = table.Column<int>(nullable: false),
                    VendedorId = table.Column<int>(nullable: false),
                    Fecha = table.Column<DateTime>(nullable: false),
                    TotalEfectivo = table.Column<decimal>(precision: 18, scale: 2, nullable: false),
                    TotalTransferencia = table.Column<decimal>(precision: 18, scale: 2, nullable: false),
                    Notas = table.Column<string>(maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RegistrosVentaDiaria", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RegistrosVentaDiaria_Locales_LocalId",
                        column: x => x.LocalId,
                        principalTable: "Locales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RegistrosVentaDiaria_Usuarios_VendedorId",
                        column: x => x.VendedorId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ConsumosSuministroDiario",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    RegistroVentaDiariaId = table.Column<int>(nullable: false),
                    SuministroId = table.Column<int>(nullable: false),
                    CantidadGastada = table.Column<decimal>(precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConsumosSuministroDiario", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ConsumosSuministroDiario_RegistrosVentaDiaria_RegistroVentaDiariaId",
                        column: x => x.RegistroVentaDiariaId,
                        principalTable: "RegistrosVentaDiaria",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ConsumosSuministroDiario_Suministros_SuministroId",
                        column: x => x.SuministroId,
                        principalTable: "Suministros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DetallesVentaDiaria",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    RegistroVentaDiariaId = table.Column<int>(nullable: false),
                    ProductoId = table.Column<int>(nullable: false),
                    CantidadVendida = table.Column<int>(nullable: false),
                    Subtotal = table.Column<decimal>(precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DetallesVentaDiaria", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DetallesVentaDiaria_Productos_ProductoId",
                        column: x => x.ProductoId,
                        principalTable: "Productos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DetallesVentaDiaria_RegistrosVentaDiaria_RegistroVentaDiariaId",
                        column: x => x.RegistroVentaDiariaId,
                        principalTable: "RegistrosVentaDiaria",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ComprasInsumo_LocalId",
                table: "ComprasInsumo",
                column: "LocalId");

            migrationBuilder.CreateIndex(
                name: "IX_ComprasInsumo_SuministroId",
                table: "ComprasInsumo",
                column: "SuministroId");

            migrationBuilder.CreateIndex(
                name: "IX_ConsumosSuministroDiario_RegistroVentaDiariaId",
                table: "ConsumosSuministroDiario",
                column: "RegistroVentaDiariaId");

            migrationBuilder.CreateIndex(
                name: "IX_ConsumosSuministroDiario_SuministroId",
                table: "ConsumosSuministroDiario",
                column: "SuministroId");

            migrationBuilder.CreateIndex(
                name: "IX_DetallesVentaDiaria_ProductoId",
                table: "DetallesVentaDiaria",
                column: "ProductoId");

            migrationBuilder.CreateIndex(
                name: "IX_DetallesVentaDiaria_RegistroVentaDiariaId",
                table: "DetallesVentaDiaria",
                column: "RegistroVentaDiariaId");

            migrationBuilder.CreateIndex(
                name: "IX_InventariosLocal_LocalId_SuministroId",
                table: "InventariosLocal",
                columns: new[] { "LocalId", "SuministroId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InventariosLocal_SuministroId",
                table: "InventariosLocal",
                column: "SuministroId");

            migrationBuilder.CreateIndex(
                name: "IX_PagosEmpleado_LocalId",
                table: "PagosEmpleado",
                column: "LocalId");

            migrationBuilder.CreateIndex(
                name: "IX_PagosEmpleado_VendedorId",
                table: "PagosEmpleado",
                column: "VendedorId");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrosVentaDiaria_LocalId",
                table: "RegistrosVentaDiaria",
                column: "LocalId");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrosVentaDiaria_VendedorId",
                table: "RegistrosVentaDiaria",
                column: "VendedorId");

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_Email",
                table: "Usuarios",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_LocalId",
                table: "Usuarios",
                column: "LocalId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ComprasInsumo");

            migrationBuilder.DropTable(
                name: "ConsumosSuministroDiario");

            migrationBuilder.DropTable(
                name: "DetallesVentaDiaria");

            migrationBuilder.DropTable(
                name: "InventariosLocal");

            migrationBuilder.DropTable(
                name: "PagosEmpleado");

            migrationBuilder.DropTable(
                name: "Productos");

            migrationBuilder.DropTable(
                name: "RegistrosVentaDiaria");

            migrationBuilder.DropTable(
                name: "Suministros");

            migrationBuilder.DropTable(
                name: "Usuarios");

            migrationBuilder.DropTable(
                name: "Locales");
        }
    }
}
