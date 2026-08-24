using FluentAssertions;
using Moq;
using PatillaDash.Application.Services;
using PatillaDash.Domain.Entities;
using PatillaDash.Domain.Interfaces;
using Xunit;

namespace PatillaDash.Tests.Application;

public class EstadisticasServiceTests
{
    private readonly Mock<IVentaRepository> _ventaRepoMock = new();
    private readonly Mock<ICompraRepository> _compraRepoMock = new();
    private readonly Mock<IPagoEmpleadoRepository> _pagoRepoMock = new();
    private readonly Mock<IInventarioRepository> _inventarioRepoMock = new();
    private readonly EstadisticasService _estadisticasService;

    public EstadisticasServiceTests()
    {
        _inventarioRepoMock.Setup(r => r.GetAllAsync())
            .ReturnsAsync(new List<InventarioLocal>());

        _estadisticasService = new EstadisticasService(
            _ventaRepoMock.Object,
            _compraRepoMock.Object,
            _pagoRepoMock.Object,
            _inventarioRepoMock.Object
        );
    }

    [Fact]
    public async Task ObtenerDashboardGeneralAsync_DeberiaCalcularIngresosGastosYMargen()
    {
        // Arrange
        var ventas = new List<RegistroVentaDiaria>
        {
            new(localId: 1, vendedorId: 1, totalEfectivo: 500000m, totalTransferencia: 200000m),
            new(localId: 1, vendedorId: 1, totalEfectivo: 300000m, totalTransferencia: 100000m)
        };

        var compras = new List<CompraInsumo>
        {
            new(localId: 1, suministroId: 1, cantidad: 20, costoTotal: 150000m, proveedor: "Frutas")
        };

        var pagos = new List<PagoEmpleado>
        {
            new(localId: 1, vendedorId: 1, monto: 80000m, observacion: "Día trabajado")
        };

        _ventaRepoMock.Setup(r => r.GetAllByDateRangeAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>()))
            .ReturnsAsync(ventas);
        _compraRepoMock.Setup(r => r.GetAllByDateRangeAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>()))
            .ReturnsAsync(compras);
        _pagoRepoMock.Setup(r => r.GetAllByDateRangeAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>()))
            .ReturnsAsync(pagos);

        // Act
        var dashboard = await _estadisticasService.ObtenerDashboardGeneralAsync();

        // Assert
        dashboard.TotalIngresos.Should().Be(1100000m); // 500k+200k + 300k+100k
        dashboard.TotalGastosCompras.Should().Be(150000m);
        dashboard.TotalGastosNomina.Should().Be(80000m);
        dashboard.BalanceNeto.Should().Be(870000m); // 1100000 - 150000 - 80000
        dashboard.MetodoPagoPredominante.Should().Be("Efectivo");
        dashboard.VentasMetodoPago.TotalEfectivo.Should().Be(800000m);
        dashboard.VentasMetodoPago.TotalTransferencia.Should().Be(300000m);
    }
}
