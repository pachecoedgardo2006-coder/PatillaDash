using FluentAssertions;
using PatillaDash.Domain.Entities;
using Xunit;

namespace PatillaDash.Tests.Domain;

public class RegistroVentaDiariaTests
{
    [Fact]
    public void TotalVenta_DeberiaSumarEfectivoYTransferencia()
    {
        // Arrange & Act
        var venta = new RegistroVentaDiaria(
            localId: 1,
            vendedorId: 2,
            totalEfectivo: 150000m,
            totalTransferencia: 50000m,
            notas: "Ventas de fin de semana"
        );

        // Assert
        venta.TotalVenta.Should().Be(200000m);
    }

    [Fact]
    public void Constructor_ConMontosEnCero_DeberiaLanzarExcepcion()
    {
        // Act
        var act = () => new RegistroVentaDiaria(
            localId: 1,
            vendedorId: 2,
            totalEfectivo: 0,
            totalTransferencia: 0
        );

        // Assert
        act.Should().Throw<InvalidOperationException>()
           .WithMessage("*al menos un monto de venta mayor a cero*");
    }

    [Fact]
    public void AgregarDetalleYConsumo_DeberiaRegistrarEnColecciones()
    {
        // Arrange
        var venta = new RegistroVentaDiaria(
            localId: 1,
            vendedorId: 2,
            totalEfectivo: 50000m,
            totalTransferencia: 0
        );

        // Act
        venta.AgregarDetalle(productoId: 1, cantidad: 10, precioUnitario: 5000m);
        venta.AgregarConsumo(suministroId: 1, cantidadGastada: 3m);

        // Assert
        venta.Detalles.Should().HaveCount(1);
        venta.Consumos.Should().HaveCount(1);
        venta.Detalles.First().Subtotal.Should().Be(50000m);
        venta.Consumos.First().CantidadGastada.Should().Be(3m);
    }
}
