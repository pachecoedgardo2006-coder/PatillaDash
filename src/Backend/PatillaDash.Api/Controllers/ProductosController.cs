using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PatillaDash.Application.DTOs.Productos;
using PatillaDash.Application.Interfaces;

namespace PatillaDash.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductosController : ControllerBase
{
    private readonly IProductoService _productoService;

    public ProductosController(IProductoService productoService)
    {
        _productoService = productoService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ProductoDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ObtenerProductos([FromQuery] bool? soloActivos)
    {
        var productos = await _productoService.ObtenerTodosAsync(soloActivos);
        return Ok(productos);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ProductoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObtenerPorId([FromRoute] int id)
    {
        var producto = await _productoService.ObtenerPorIdAsync(id);
        if (producto == null)
        {
            return NotFound(new { message = $"El producto #{id} no existe." });
        }
        return Ok(producto);
    }

    [HttpPost]
    [Authorize(Roles = "Administrador")]
    [ProducesResponseType(typeof(ProductoDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CrearProducto([FromBody] CrearProductoDto dto)
    {
        var creado = await _productoService.CrearProductoAsync(dto);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = creado.Id }, creado);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Administrador")]
    [ProducesResponseType(typeof(ProductoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ActualizarProducto([FromRoute] int id, [FromBody] ActualizarProductoDto dto)
    {
        var actualizado = await _productoService.ActualizarProductoAsync(id, dto);
        return Ok(actualizado);
    }

    [HttpPatch("{id:int}/toggle")]
    [Authorize(Roles = "Administrador")]
    [ProducesResponseType(typeof(ProductoDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> AlternarEstado([FromRoute] int id)
    {
        var actualizado = await _productoService.ToggleActivoAsync(id);
        return Ok(actualizado);
    }
}
