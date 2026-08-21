using FluentAssertions;
using PatillaDash.Domain.Entities;
using PatillaDash.Domain.Enums;
using Xunit;

namespace PatillaDash.Tests.Domain;

public class UsuarioTests
{
    [Fact]
    public void Vendedor_SinLocalId_DeberiaLanzarInvalidOperationException()
    {
        // Act
        var act = () => new Usuario(
            nombre: "Juan Perez",
            email: "juan@patilladash.com",
            passwordHash: "hash123",
            rol: RolUsuario.Vendedor,
            localId: null
        );

        // Assert
        act.Should().Throw<InvalidOperationException>()
           .WithMessage("*debe estar asignado a un local*");
    }

    [Fact]
    public void Administrador_SinLocalId_DeberiaCrearseExitosamente()
    {
        // Act
        var admin = new Usuario(
            nombre: "Admin Global",
            email: "admin@patilladash.com",
            passwordHash: "hash123",
            rol: RolUsuario.Administrador,
            localId: null
        );

        // Assert
        admin.Should().NotBeNull();
        admin.Rol.Should().Be(RolUsuario.Administrador);
        admin.LocalId.Should().BeNull();
    }
}
