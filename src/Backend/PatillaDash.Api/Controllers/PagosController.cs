using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PatillaDash.Application.DTOs.Pagos;
using PatillaDash.Application.Interfaces;

namespace PatillaDash.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrador")]
public class PagosController : ControllerBase
{
    private readonly IPagoEmpleadoService _pagoEmpleadoService;

    public PagosController(IPagoEmpleadoService pagoEmpleadoService)
    {
        _pagoEmpleadoService = pagoEmpleadoService;
    }

    [HttpPost]
    [ProducesResponseType(typeof(PagoResumenDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RegistrarPago([FromBody] RegistrarPagoDto dto)
    {
        var pago = await _pagoEmpleadoService.RegistrarPagoAsync(dto);
        return Ok(pago);
    }

    [HttpGet("vendedor/{vendedorId:int}")]
    [ProducesResponseType(typeof(IEnumerable<PagoResumenDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ObtenerPagosPorVendedor([FromRoute] int vendedorId)
    {
        var pagos = await _pagoEmpleadoService.ObtenerPagosPorVendedorAsync(vendedorId);
        return Ok(pagos);
    }

    [HttpGet("local/{localId:int}")]
    [ProducesResponseType(typeof(IEnumerable<PagoResumenDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ObtenerPagosPorLocal([FromRoute] int localId)
    {
        var pagos = await _pagoEmpleadoService.ObtenerPagosPorLocalAsync(localId);
        return Ok(pagos);
    }
}
