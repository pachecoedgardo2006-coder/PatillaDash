using PatillaDash.Application.DTOs.Pagos;

namespace PatillaDash.Application.Interfaces;

public interface IPagoEmpleadoService
{
    Task<PagoResumenDto> RegistrarPagoAsync(RegistrarPagoDto dto);
    Task<IEnumerable<PagoResumenDto>> ObtenerPagosPorVendedorAsync(int vendedorId);
    Task<IEnumerable<PagoResumenDto>> ObtenerPagosPorLocalAsync(int localId);
}