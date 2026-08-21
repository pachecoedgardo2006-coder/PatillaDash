using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PatillaDash.Application.DTOs.Inventario;
using PatillaDash.Application.Interfaces;
using PatillaDash.Domain.Enums;

namespace PatillaDash.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InventarioController : ControllerBase
{
    private readonly IInventarioService _inventarioService;

    public InventarioController(IInventarioService inventarioService)
    {
        _inventarioService = inventarioService;
    }

    [HttpGet("local/{localId:int}")]
    [Authorize(Roles = "Administrador,Vendedor")]
    [ProducesResponseType(typeof(IEnumerable<InventarioLocalDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ObtenerInventarioPorLocal([FromRoute] int localId)
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

        var inventario = await _inventarioService.ObtenerInventarioPorLocalAsync(localId);
        return Ok(inventario);
    }

    [HttpPut("stock")]
    [Authorize(Roles = "Administrador")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ActualizarStockManual([FromBody] ActualizarStockDto dto)
    {
        await _inventarioService.ActualizarStockManualAsync(dto);
        return Ok(new { message = "Stock actualizado exitosamente." });
    }
}
