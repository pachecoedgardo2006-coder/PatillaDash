using PatillaDash.Application.DTOs.Auth;

namespace PatillaDash.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<IEnumerable<UsuarioDto>> ObtenerUsuariosAsync(int? localId = null);
}
