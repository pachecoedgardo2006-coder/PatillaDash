using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using PatillaDash.Application.DTOs.Auth;
using PatillaDash.Application.Interfaces;

namespace PatillaDash.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("loginLimiter")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var response = await _authService.LoginAsync(dto);
        return Ok(response);
    }

    [HttpPost("register")]
    [Authorize(Roles = "Administrador")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var response = await _authService.RegisterAsync(dto);
        return Ok(response);
    }

    [HttpGet("usuarios")]
    [Authorize(Roles = "Administrador")]
    [ProducesResponseType(typeof(IEnumerable<UsuarioDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ObtenerUsuarios([FromQuery] int? localId)
    {
        var usuarios = await _authService.ObtenerUsuariosAsync(localId);
        return Ok(usuarios);
    }
}
