using FluentAssertions;
using Moq;
using PatillaDash.Application.DTOs.Compras;
using PatillaDash.Application.Services;
using PatillaDash.Domain.Entities;
using PatillaDash.Domain.Interfaces;
using Xunit;

namespace PatillaDash.Tests.Application;

public class CompraServiceTests
{
    private readonly Mock<ICompraRepository> _compraRepoMock = new();
    private readonly Mock<IInventarioRepository> _inventarioRepoMock = new();
    private readonly CompraService _compraService;

    public CompraServiceTests()
    {
        _compraService = new CompraService(_compraRepoMock.Object, _inventarioRepoMock.Object);
    }

    [Fact]
    public async Task RegistrarCompraAsync_ConInventarioExistente_DeberiaIncrementarStock()
    {
        // Arrange
        var inventarioExistente = new InventarioLocal(localId: 1, suministroId: 2, cantidadInicial: 10m);
        _inventarioRepoMock.Setup(r => r.GetByLocalAndSuministroAsync(1, 2))
            .ReturnsAsync(inventarioExistente);

        var dto = new CrearCompraDto
        {
            LocalId = 1,
            SuministroId = 2,
            Cantidad = 50m,
            CostoTotal = 250000m,
            Proveedor = "Distribuidora Frutas SAS"
        };

        // Act
        var result = await _compraService.RegistrarCompraAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.Cantidad.Should().Be(50m);
        result.CostoTotal.Should().Be(250000m);

        // Verifica que la compra fue guardada
        _compraRepoMock.Verify(r => r.AddAsync(It.IsAny<CompraInsumo>()), Times.Once);

        // Verifica que el stock subió atómicamente de 10 a 60
        inventarioExistente.CantidadDisponible.Should().Be(60m);
        _inventarioRepoMock.Verify(r => r.UpdateAsync(inventarioExistente), Times.Once);
    }
}
