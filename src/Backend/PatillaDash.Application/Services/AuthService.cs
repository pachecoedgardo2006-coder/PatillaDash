using PatillaDash.Application.DTOs.Auth;
using PatillaDash.Application.Interfaces;
using PatillaDash.Domain.Entities;
using PatillaDash.Domain.Interfaces;

namespace PatillaDash.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUsuarioRepository _usuarioRepository;

    public AuthService(IUsuarioRepository usuarioRepository)
    {
        _usuarioRepository = usuarioRepository;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var usuario = await _usuarioRepository.GetByEmailAsync(dto.Email);
        if (usuario == null)
            throw new InvalidOperationException("Credenciales inválidas.");

        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(dto.Password, usuario.PasswordHash);
        if (!isPasswordValid)
            throw new InvalidOperationException("Credenciales inválidas.");

        return new AuthResponseDto
        {
            Token = "PENDING_JWT_GENERATION",
            Nombre = usuario.Nombre,
            Email = usuario.Email,
            Rol = usuario.Rol.ToString(),
            LocalId = usuario.LocalId ?? 0
        };
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        var existe = await _usuarioRepository.GetByEmailAsync(dto.Email);
        if (existe != null)
            throw new InvalidOperationException("El email ya está registrado.");

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        
        var usuario = new Usuario(
            dto.Nombre,
            dto.Email,
            passwordHash,
            dto.Rol,
            dto.LocalId
        );

        await _usuarioRepository.AddAsync(usuario);

        return new AuthResponseDto
        {
            Token = "PENDING_JWT_GENERATION",
            Nombre = usuario.Nombre,
            Email = usuario.Email,
            Rol = usuario.Rol.ToString(),
            LocalId = usuario.LocalId ?? 0
        };
    }
}