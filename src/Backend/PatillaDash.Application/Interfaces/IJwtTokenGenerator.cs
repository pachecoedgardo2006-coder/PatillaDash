using PatillaDash.Domain.Entities;

namespace PatillaDash.Application.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(Usuario usuario);
}
