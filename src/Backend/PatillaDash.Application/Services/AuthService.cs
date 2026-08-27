using PatillaDash.Application.DTOs.Auth;
using PatillaDash.Application.Interfaces;
using PatillaDash.Domain.Entities;
using PatillaDash.Domain.Interfaces;

namespace PatillaDash.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IPasswordHasher _passwordHasher;

    public AuthService(
        IUsuarioRepository usuarioRepository,
        IJwtTokenGenerator jwtTokenGenerator,
        IPasswordHasher passwordHasher)
    {
        _usuarioRepository = usuarioRepository;
        _jwtTokenGenerator = jwtTokenGenerator;
        _passwordHasher = passwordHasher;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var usuario = await _usuarioRepository.GetByEmailAsync(dto.Email);
        if (usuario == null)
            throw new InvalidOperationException("Credenciales inválidas.");

        bool isPasswordValid = _passwordHasher.VerifyPassword(dto.Password, usuario.PasswordHash);
        if (!isPasswordValid)
            throw new InvalidOperationException("Credenciales inválidas.");

        var token = _jwtTokenGenerator.GenerateToken(usuario);

        return new AuthResponseDto
        {
            Id = usuario.Id,
            Token = token,
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

        var passwordHash = _passwordHasher.HashPassword(dto.Password);
        
        var usuario = new Usuario(
            dto.Nombre,
            dto.Email,
            passwordHash,
            dto.Rol,
            dto.LocalId
        );

        await _usuarioRepository.AddAsync(usuario);

        var token = _jwtTokenGenerator.GenerateToken(usuario);

        return new AuthResponseDto
        {
            Id = usuario.Id,
            Token = token,
            Nombre = usuario.Nombre,
            Email = usuario.Email,
            Rol = usuario.Rol.ToString(),
            LocalId = usuario.LocalId ?? 0
        };
    }

    public async Task<IEnumerable<UsuarioDto>> ObtenerUsuariosAsync(int? localId = null)
    {
        var usuarios = await _usuarioRepository.GetAllAsync();
        if (localId.HasValue && localId.Value > 0)
        {
            usuarios = usuarios.Where(u => u.LocalId == localId.Value);
        }

        return usuarios.Select(u => new UsuarioDto
        {
            Id = u.Id,
            Nombre = u.Nombre,
            Email = u.Email,
            Rol = u.Rol.ToString(),
            LocalId = u.LocalId,
            NombreLocal = u.Local?.Nombre ?? (u.LocalId.HasValue ? $"Local #{u.LocalId}" : "Global")
        });
    }
}
