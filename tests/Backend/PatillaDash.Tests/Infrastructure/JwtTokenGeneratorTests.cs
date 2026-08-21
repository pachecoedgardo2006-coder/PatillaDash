using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using PatillaDash.Domain.Entities;
using PatillaDash.Domain.Enums;
using PatillaDash.Infrastructure.Auth;
using Xunit;

namespace PatillaDash.Tests.Infrastructure;

public class JwtTokenGeneratorTests
{
    [Fact]
    public void GenerateToken_DeberiaGenerarTokenJwtConClaimsCorrectos()
    {
        // Arrange
        var inMemorySettings = new Dictionary<string, string?>
        {
            {"Jwt:SecretKey", "PatillaDashSecretKey_ParaAutenticacionSeguraJWT_2026!"},
            {"Jwt:Issuer", "PatillaDashApi"},
            {"Jwt:Audience", "PatillaDashClient"}
        };

        IConfiguration configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        var generator = new JwtTokenGenerator(configuration);
        var usuario = new Usuario("Maria Vendedora", "maria@patilladash.com", "hash", RolUsuario.Vendedor, 2);

        // Act
        var tokenString = generator.GenerateToken(usuario);

        // Assert
        tokenString.Should().NotBeNullOrWhiteSpace();

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(tokenString);

        jwt.Issuer.Should().Be("PatillaDashApi");
        jwt.Audiences.Should().Contain("PatillaDashClient");
        jwt.Claims.Should().Contain(c => (c.Type == ClaimTypes.Email || c.Type == "email") && c.Value == "maria@patilladash.com");
        jwt.Claims.Should().Contain(c => (c.Type == ClaimTypes.Role || c.Type == "role") && c.Value == "Vendedor");
        jwt.Claims.Should().Contain(c => c.Type == "LocalId" && c.Value == "2");
    }
}
