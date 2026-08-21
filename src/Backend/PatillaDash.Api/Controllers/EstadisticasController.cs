using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PatillaDash.Application.DTOs.Estadisticas;
using PatillaDash.Application.Interfaces;

namespace PatillaDash.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrador")]
public class EstadisticasController : ControllerBase
{
    private readonly IEstadisticasService _estadisticasService;

    public EstadisticasController(IEstadisticasService estadisticasService)
    {
        _estadisticasService = estadisticasService;
    }

    [HttpGet("dashboard")]
    [ProducesResponseType(typeof(DashboardEstadisticasDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> ObtenerDashboardGeneral(
        [FromQuery] DateTime? fechaInicio,
        [FromQuery] DateTime? fechaFin)
    {
        var stats = await _estadisticasService.ObtenerDashboardGeneralAsync(fechaInicio, fechaFin);
        return Ok(stats);
    }
}
