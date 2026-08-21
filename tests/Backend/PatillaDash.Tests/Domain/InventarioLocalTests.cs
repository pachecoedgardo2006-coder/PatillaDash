using FluentAssertions;
using PatillaDash.Domain.Entities;
using Xunit;

namespace PatillaDash.Tests.Domain;

public class InventarioLocalTests
{
    [Fact]
    public void IncrementarStock_ConCantidadPositiva_DeberiaAumentarCantidadDisponible()
    {
        // Arrange
        var inventario = new InventarioLocal(localId: 1, suministroId: 1, cantidadInicial: 10m);

        // Act
        inventario.IncrementarStock(5m);

        // Assert
        inventario.CantidadDisponible.Should().Be(15m);
    }

    [Fact]
    public void DescontarStock_ConCantidadValida_DeberiaDisminuirCantidadDisponible()
    {
        // Arrange
        var inventario = new InventarioLocal(localId: 1, suministroId: 1, cantidadInicial: 10m);

        // Act
        inventario.DescontarStock(4m);

        // Assert
        inventario.CantidadDisponible.Should().Be(6m);
    }

    [Fact]
    public void DescontarStock_MayorQueDisponible_DeberiaLanzarInvalidOperationException()
    {
        // Arrange
        var inventario = new InventarioLocal(localId: 1, suministroId: 1, cantidadInicial: 5m);

        // Act
        var act = () => inventario.DescontarStock(10m);

        // Assert
        act.Should().Throw<InvalidOperationException>()
           .WithMessage("*Stock insuficiente*");
    }

    [Theory]
    [InlineData(10, 15, true)]  // 10 disponible <= 15 stockMinimo -> Alerta
    [InlineData(10, 10, true)]  // 10 disponible == 10 stockMinimo -> Alerta
    [InlineData(10, 5, false)]  // 10 disponible > 5 stockMinimo -> Normal
    public void RequiereAlertaStock_DeberiaEvaluarCorrectamente(decimal cantidadDisponible, decimal stockMinimo, bool resultadoEsperado)
    {
        // Arrange
        var inventario = new InventarioLocal(localId: 1, suministroId: 1, cantidadInicial: cantidadDisponible);

        // Act
        var requiereAlerta = inventario.RequiereAlertaStock(stockMinimo);

        // Assert
        requiereAlerta.Should().Be(resultadoEsperado);
    }
}
