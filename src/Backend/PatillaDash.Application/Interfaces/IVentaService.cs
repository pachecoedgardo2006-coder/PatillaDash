using PatillaDash.Application.DTOs.Ventas;

namespace PatillaDash.Application.Interfaces;

public interface IVentaService
{
    Task<VentaResumenDto> RegistrarVentaDiariaAsync(CrearVentaDiariaDto dto);
    Task<IEnumerable<VentaResumenDto>> ObtenerVentasPorLocalAsync(int localId);
    Task<IEnumerable<VentaResumenDto>> ObtenerHistorialVentasAsync(int? localId = null);
    Task<VentaResumenDto?> ObtenerDetalleVentaAsync(int id);
}
