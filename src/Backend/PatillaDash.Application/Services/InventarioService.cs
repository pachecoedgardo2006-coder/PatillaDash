using PatillaDash.Application.DTOs.Inventario;
using PatillaDash.Application.Interfaces;
using PatillaDash.Domain.Interfaces;

namespace PatillaDash.Application.Services;

public class InventarioService : IInventarioService
{
    private readonly IInventarioRepository _inventarioRepository;

    public InventarioService(IInventarioRepository inventarioRepository)
    {
        _inventarioRepository = inventarioRepository;
    }

    public async Task<IEnumerable<InventarioLocalDto>> ObtenerInventarioPorLocalAsync(int localId)
    {
        var items = await _inventarioRepository.GetByLocalIdAsync(localId);
        
        return items.Select(i => new InventarioLocalDto
        {
            SuministroId = i.SuministroId,
            NombreSuministro = i.Suministro?.Nombre ?? string.Empty,
            UnidadMedida = i.Suministro?.UnidadMedida.ToString() ?? string.Empty,
            CantidadDisponible = i.CantidadDisponible,
            StockMinimoAlerta = i.Suministro?.StockMinimoAlerta ?? 0
        });
    }

    public async Task ActualizarStockManualAsync(ActualizarStockDto dto)
    {
        var item = await _inventarioRepository.GetByLocalAndSuministroAsync(dto.LocalId, dto.SuministroId);
        if (item != null)
        {
            var diferencia = dto.NuevaCantidad - item.CantidadDisponible;
            if (diferencia > 0)
            {
                item.IncrementarStock(diferencia);
            }
            else if (diferencia < 0)
            {
                item.DescontarStock(Math.Abs(diferencia));
            }

            await _inventarioRepository.UpdateAsync(item);
        }
    }
}