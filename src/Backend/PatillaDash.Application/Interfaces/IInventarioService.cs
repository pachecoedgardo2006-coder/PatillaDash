using PatillaDash.Application.DTOs.Inventario;

namespace PatillaDash.Application.Interfaces;

public interface IInventarioService
{
    Task<IEnumerable<InventarioLocalDto>> ObtenerInventarioPorLocalAsync(int localId);
    Task ActualizarStockManualAsync(ActualizarStockDto dto);
}