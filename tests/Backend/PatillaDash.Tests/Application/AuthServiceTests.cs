using FluentAssertions;
using Moq;
using PatillaDash.Application.DTOs.Auth;
using PatillaDash.Application.Interfaces;
using PatillaDash.Application.Services;
using PatillaDash.Domain.Entities;
using PatillaDash.Domain.Enums;
using PatillaDash.Domain.Interfaces;
using Xunit;

namespace PatillaDash.Tests.Application;

public class AuthServiceTests
{
    private readonly Mock<IUsuarioRepository> _usuarioRepoMock = new();
    private readonly Mock<IJwtTokenGenerator> _jwtTokenMock = new();
    private readonly Mock<IPasswordHasher> _passwordHasherMock = new();
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        _authService = new AuthService(
            _usuarioRepoMock.Object,
            _jwtTokenMock.Object,
            _passwordHasherMock.Object
        );
    }

    [Fact]
    public async Task LoginAsync_ConCredencialesValidas_DeberiaRetornarAuthResponseDto()
    {
        // Arrange
        var usuario = new Usuario("Juan", "juan@patilladash.com", "hashed_pwd", RolUsuario.Vendedor, 1);
        _usuarioRepoMock.Setup(r => r.GetByEmailAsync("juan@patilladash.com")).ReturnsAsync(usuario);
        _passwordHasherMock.Setup(p => p.VerifyPassword("123456", "hashed_pwd")).Returns(true);
        _jwtTokenMock.Setup(j => j.GenerateToken(usuario)).Returns("jwt_token_sample");

        var loginDto = new LoginDto
        {
            Email = "juan@patilladash.com",
            Password = "123456"
        };

        // Act
        var result = await _authService.LoginAsync(loginDto);

        // Assert
        result.Should().NotBeNull();
        result.Token.Should().Be("jwt_token_sample");
        result.Email.Should().Be("juan@patilladash.com");
        result.Rol.Should().Be("Vendedor");
        result.LocalId.Should().Be(1);
    }

    [Fact]
    public async Task LoginAsync_ConPasswordInvalido_DeberiaLanzarInvalidOperationException()
    {
        // Arrange
        var usuario = new Usuario("Juan", "juan@patilladash.com", "hashed_pwd", RolUsuario.Vendedor, 1);
        _usuarioRepoMock.Setup(r => r.GetByEmailAsync("juan@patilladash.com")).ReturnsAsync(usuario);
        _passwordHasherMock.Setup(p => p.VerifyPassword("wrong_pwd", "hashed_pwd")).Returns(false);

        var loginDto = new LoginDto
        {
            Email = "juan@patilladash.com",
            Password = "wrong_pwd"
        };

        // Act
        var act = async () => await _authService.LoginAsync(loginDto);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Credenciales inválidas*");
    }
}
