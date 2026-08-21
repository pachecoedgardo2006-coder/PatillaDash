using FluentAssertions;
using PatillaDash.Infrastructure.Auth;
using Xunit;

namespace PatillaDash.Tests.Infrastructure;

public class PasswordHasherTests
{
    private readonly PasswordHasher _hasher = new();

    [Fact]
    public void HashPassword_DeberiaGenerarHashValidoYVerificable()
    {
        // Arrange
        var password = "SuperSecretPassword123!";

        // Act
        var hash = _hasher.HashPassword(password);
        var isValid = _hasher.VerifyPassword(password, hash);
        var isInvalid = _hasher.VerifyPassword("WrongPassword", hash);

        // Assert
        hash.Should().NotBeNullOrWhiteSpace();
        hash.Should().NotBe(password);
        isValid.Should().BeTrue();
        isInvalid.Should().BeFalse();
    }
}
