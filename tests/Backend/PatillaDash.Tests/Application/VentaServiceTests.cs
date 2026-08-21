using FluentAssertions;
using Moq;
using PatillaDash.Application.DTOs.Ventas;
using PatillaDash.Application.Services;
using PatillaDash.Domain.Entities;
using PatillaDash.Domain.Interfaces;
using Xunit;

namespace PatillaDash.Tests.Application;

public class VentaServiceTests
{
    private readonly Mock<IVentaRepository> _ventaRepoMock = new();
    private readonly Mock<IInventarioRepository> _inventarioRepoMock = new();
    private readonly VentaService _ventaService;

    public VentaServiceTests()
    {
        _ventaService = new VentaService(_ventaRepoMock.Object, _inventarioRepoMock.Object);
    }

    [Fact]
    public async Task RegistrarVentaDiariaAsync_DeberiaGuardarVentaYDescontarInsumosDeclarados()
    {
        // Arrange
        var inventarioPatillas = new InventarioLocal(localId: 1, suministroId: 1, cantidadInicial: 20m);
        _inventarioRepoMock.Setup(r => r.GetByLocalAndSuministroAsync(1, 1))
            .ReturnsAsync(inventarioPatillas);

        var dto = new CrearVentaDiariaDto
        {
            LocalId = 1,
            VendedorId = 2,
            TotalEfectivo = 120000m,
            TotalTransferencia = 30000m,
            Notas = "Cierre exitoso",
            Detalles = new List<DetalleVentaDto>
            {
                new() { ProductoId = 1, CantidadVendida = 15, Subtotal = 75000m },
                new() { ProductoId = 2, CantidadVendida = 10, Subtotal = 75000m }
            },
            Consumos = new List<ConsumoDto>
            {
                new() { SuministroId = 1, CantidadGastada = 4m }
            }
        };

        // Act
        var result = await _ventaService.RegistrarVentaDiariaAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.TotalEfectivo.Should().Be(120000m);
        result.TotalTransferencia.Should().Be(30000m);

        // Verifica que la venta fue guardada
        _ventaRepoMock.Verify(r => r.AddAsync(It.IsAny<RegistroVentaDiaria>()), Times.Once);

        // Verifica que el inventario se descontó según insumo declarado (20 - 4 = 16)
        inventarioPatillas.CantidadDisponible.Should().Be(16m);
        _inventarioRepoMock.Verify(r => r.UpdateAsync(inventarioPatillas), Times.Once);
    }
}
