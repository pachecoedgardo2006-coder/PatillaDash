using PatillaDash.Domain.Enums;

namespace PatillaDash.Application.DTOs.Auth;

public class RegisterDto
{
    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public RolUsuario Rol { get; set; }
    public int LocalId { get; set; }
}