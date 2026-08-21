using FluentAssertions;
using Moq;
using PatillaDash.Application.DTOs.Inventario;
using PatillaDash.Application.Services;
using PatillaDash.Domain.Entities;
using PatillaDash.Domain.Interfaces;
using Xunit;

namespace PatillaDash.Tests.Application;

public class InventarioServiceTests
{
    private readonly Mock<IInventarioRepository> _inventarioRepoMock = new();
    private readonly InventarioService _inventarioService;

    public InventarioServiceTests()
    {
        _inventarioService = new InventarioService(_inventarioRepoMock.Object);
    }

    [Fact]
    public async Task ActualizarStockManualAsync_DeberiaAjustarStockCorrectamente()
    {
        // Arrange
        var inventario = new InventarioLocal(localId: 1, suministroId: 1, cantidadInicial: 20m);
        _inventarioRepoMock.Setup(r => r.GetByLocalAndSuministroAsync(1, 1))
            .ReturnsAsync(inventario);

        var dto = new ActualizarStockDto
        {
            LocalId = 1,
            SuministroId = 1,
            NuevaCantidad = 35m
        };

        // Act
        await _inventarioService.ActualizarStockManualAsync(dto);

        // Assert
        inventario.CantidadDisponible.Should().Be(35m);
        _inventarioRepoMock.Verify(r => r.UpdateAsync(inventario), Times.Once);
    }
}
