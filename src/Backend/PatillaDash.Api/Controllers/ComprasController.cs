using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PatillaDash.Application.DTOs.Compras;
using PatillaDash.Application.Interfaces;

namespace PatillaDash.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrador")]
public class ComprasController : ControllerBase
{
    private readonly ICompraService _compraService;

    public ComprasController(ICompraService compraService)
    {
        _compraService = compraService;
    }

    [HttpPost]
    [ProducesResponseType(typeof(CompraResumenDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RegistrarCompra([FromBody] CrearCompraDto dto)
    {
        var compra = await _compraService.RegistrarCompraAsync(dto);
        return Ok(compra);
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<CompraResumenDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ObtenerHistorialCompras([FromQuery] int? localId)
    {
        var compras = await _compraService.ObtenerHistorialComprasAsync(localId);
        return Ok(compras);
    }
}
