using System.Collections.Generic;
using System.Threading.Tasks;
using PatillaDash.Application.DTOs.Productos;

namespace PatillaDash.Application.Interfaces;

public interface IProductoService
{
    Task<IEnumerable<ProductoDto>> ObtenerTodosAsync(bool? soloActivos = null);
    Task<ProductoDto?> ObtenerPorIdAsync(int id);
    Task<ProductoDto> CrearProductoAsync(CrearProductoDto dto);
    Task<ProductoDto> ActualizarProductoAsync(int id, ActualizarProductoDto dto);
    Task<ProductoDto> ToggleActivoAsync(int id);
}
