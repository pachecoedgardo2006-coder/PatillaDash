using PatillaDash.Application.DTOs.Pagos;
using PatillaDash.Application.Interfaces;
using PatillaDash.Domain.Entities;
using PatillaDash.Domain.Interfaces;

namespace PatillaDash.Application.Services;

public class PagoEmpleadoService : IPagoEmpleadoService
{
    private readonly IPagoEmpleadoRepository _pagoRepository;

    public PagoEmpleadoService(IPagoEmpleadoRepository pagoRepository)
    {
        _pagoRepository = pagoRepository;
    }

    public async Task<PagoResumenDto> RegistrarPagoAsync(RegistrarPagoDto dto)
    {
        var pago = new PagoEmpleado(
            dto.LocalId,
            dto.VendedorId,
            dto.Monto,
            dto.Observacion
        );

        await _pagoRepository.AddAsync(pago);

        return new PagoResumenDto
        {
            Id = pago.Id,
            LocalId = pago.LocalId,
            VendedorId = pago.VendedorId,
            Monto = pago.Monto,
            FechaPago = pago.FechaPago,
            Observacion = pago.Observacion
        };
    }

    public async Task<IEnumerable<PagoResumenDto>> ObtenerPagosPorVendedorAsync(int vendedorId)
    {
        var desde = DateTime.UtcNow.AddMonths(-1);
        var hasta = DateTime.UtcNow;

        var pagos = await _pagoRepository.GetAllByDateRangeAsync(desde, hasta);
        
        return pagos
            .Where(p => p.VendedorId == vendedorId)
            .Select(p => new PagoResumenDto
            {
                Id = p.Id,
                LocalId = p.LocalId,
                VendedorId = p.VendedorId,
                Monto = p.Monto,
                FechaPago = p.FechaPago,
                Observacion = p.Observacion
            });
    }

    public async Task<IEnumerable<PagoResumenDto>> ObtenerPagosPorLocalAsync(int localId)
    {
        var pagos = await _pagoRepository.GetByLocalIdAsync(localId);

        return pagos.Select(p => new PagoResumenDto
        {
            Id = p.Id,
            LocalId = p.LocalId,
            VendedorId = p.VendedorId,
            Monto = p.Monto,
            FechaPago = p.FechaPago,
            Observacion = p.Observacion
        });
    }
}