using FluentAssertions;
using PatillaDash.Application.DTOs.Auth;
using PatillaDash.Application.DTOs.Compras;
using PatillaDash.Application.DTOs.Ventas;
using PatillaDash.Application.Validators;
using Xunit;

namespace PatillaDash.Tests.Application;

public class ValidatorsTests
{
    [Fact]
    public void LoginDtoValidator_ConEmailInvalidoOPasswordCorto_DeberiaFallar()
    {
        // Arrange
        var validator = new LoginDtoValidator();
        var dto = new LoginDto
        {
            Email = "correo-invalido",
            Password = "123" // Menos de 6 caracteres
        };

        // Act
        var result = validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Email");
        result.Errors.Should().Contain(e => e.PropertyName == "Password");
    }

    [Fact]
    public void CrearCompraDtoValidator_ConMontoNegativo_DeberiaFallar()
    {
        // Arrange
        var validator = new CrearCompraDtoValidator();
        var dto = new CrearCompraDto
        {
            LocalId = 1,
            SuministroId = 1,
            Cantidad = 0,
            CostoTotal = -100,
            Proveedor = ""
        };

        // Act
        var result = validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Cantidad");
        result.Errors.Should().Contain(e => e.PropertyName == "CostoTotal");
        result.Errors.Should().Contain(e => e.PropertyName == "Proveedor");
    }
}
