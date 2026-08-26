using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PatillaDash.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AgregarProductoActivo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Activo",
                table: "Productos",
                nullable: false,
                defaultValue: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Activo",
                table: "Productos");
        }
    }
}
