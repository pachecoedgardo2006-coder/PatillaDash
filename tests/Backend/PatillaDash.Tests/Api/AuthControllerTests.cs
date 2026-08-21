using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;
using PatillaDash.Api.Controllers;
using PatillaDash.Application.DTOs.Auth;
using PatillaDash.Application.Interfaces;
using Xunit;

namespace PatillaDash.Tests.Api;

public class AuthControllerTests
{
    private readonly Mock<IAuthService> _authServiceMock = new();
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _controller = new AuthController(_authServiceMock.Object);
    }

    [Fact]
    public async Task Login_ConDatosValidos_DeberiaRetornarOkConAuthResponseDto()
    {
        // Arrange
        var loginDto = new LoginDto { Email = "admin@patilladash.com", Password = "Password123!" };
        var expectedResponse = new AuthResponseDto
        {
            Token = "sample_token",
            Nombre = "Admin",
            Email = "admin@patilladash.com",
            Rol = "Administrador",
            LocalId = 0
        };

        _authServiceMock.Setup(s => s.LoginAsync(loginDto)).ReturnsAsync(expectedResponse);

        // Act
        var result = await _controller.Login(loginDto);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<AuthResponseDto>().Subject;
        response.Token.Should().Be("sample_token");
        response.Email.Should().Be("admin@patilladash.com");
    }
}
