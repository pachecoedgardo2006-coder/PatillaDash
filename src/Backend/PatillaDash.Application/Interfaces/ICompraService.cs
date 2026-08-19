using PatillaDash.Application.DTOs.Compras;

namespace PatillaDash.Application.Interfaces;

public interface ICompraService
{
    Task<CompraResumenDto> RegistrarCompraAsync(CrearCompraDto dto);
    Task<IEnumerable<CompraResumenDto>> ObtenerHistorialComprasAsync(int? localId = null);
}