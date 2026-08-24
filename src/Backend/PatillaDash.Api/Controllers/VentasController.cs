using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PatillaDash.Application.DTOs.Ventas;
using PatillaDash.Application.Interfaces;
using PatillaDash.Domain.Enums;

namespace PatillaDash.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VentasController : ControllerBase
{
    private readonly IVentaService _ventaService;

    public VentasController(IVentaService ventaService)
    {
        _ventaService = ventaService;
    }

    [HttpPost("diaria")]
    [Authorize(Roles = "Administrador,Vendedor")]
    [ProducesResponseType(typeof(VentaResumenDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> RegistrarVentaDiaria([FromBody] CrearVentaDiariaDto dto)
    {
        var rol = User.FindFirst(ClaimTypes.Role)?.Value;
        var localIdClaim = User.FindFirst("LocalId")?.Value;
        var usuarioIdClaim = User.FindFirst("UsuarioId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (rol == RolUsuario.Vendedor.ToString())
        {
            if (int.TryParse(localIdClaim, out var localId) && localId > 0)
            {
                dto.LocalId = localId;
            }

            if (int.TryParse(usuarioIdClaim, out var vendedorId) && vendedorId > 0)
            {
                dto.VendedorId = vendedorId;
            }
        }

        var resultado = await _ventaService.RegistrarVentaDiariaAsync(dto);
        return Ok(resultado);
    }

    [HttpGet]
    [Authorize(Roles = "Administrador")]
    [ProducesResponseType(typeof(IEnumerable<VentaResumenDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ObtenerHistorialVentas([FromQuery] int? localId)
    {
        var ventas = await _ventaService.ObtenerHistorialVentasAsync(localId);
        return Ok(ventas);
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Administrador,Vendedor")]
    [ProducesResponseType(typeof(VentaResumenDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObtenerDetalleVenta([FromRoute] int id)
    {
        var venta = await _ventaService.ObtenerDetalleVentaAsync(id);
        if (venta == null)
            return NotFound(new { message = $"No se encontró la venta con ID {id}." });

        return Ok(venta);
    }

    [HttpGet("local/{localId:int}")]
    [Authorize(Roles = "Administrador,Vendedor")]
    [ProducesResponseType(typeof(IEnumerable<VentaResumenDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ObtenerVentasPorLocal([FromRoute] int localId)
    {
        var rol = User.FindFirst(ClaimTypes.Role)?.Value;
        var localIdClaim = User.FindFirst("LocalId")?.Value;

        if (rol == RolUsuario.Vendedor.ToString())
        {
            if (int.TryParse(localIdClaim, out var userLocalId) && userLocalId != localId)
            {
                return Forbid();
            }
        }

        var ventas = await _ventaService.ObtenerVentasPorLocalAsync(localId);
        return Ok(ventas);
    }
}
