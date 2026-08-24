using PatillaDash.Application.DTOs.Pagos;
using PatillaDash.Application.Interfaces;
using PatillaDash.Domain.Entities;
using PatillaDash.Domain.Interfaces;

namespace PatillaDash.Application.Services;

public class PagoEmpleadoService : IPagoEmpleadoService
{
    private readonly IPagoEmpleadoRepository _pagoRepository;
    private readonly IUsuarioRepository _usuarioRepository;

    public PagoEmpleadoService(
        IPagoEmpleadoRepository pagoRepository,
        IUsuarioRepository usuarioRepository)
    {
        _pagoRepository = pagoRepository;
        _usuarioRepository = usuarioRepository;
    }

    public async Task<PagoResumenDto> RegistrarPagoAsync(RegistrarPagoDto dto)
    {
        var vendedor = await _usuarioRepository.GetByIdAsync(dto.VendedorId);
        if (vendedor == null)
            throw new InvalidOperationException("El trabajador seleccionado no existe.");

        int localEfectivo = dto.LocalId;
        if (vendedor.LocalId.HasValue && vendedor.LocalId.Value > 0)
        {
            if (dto.LocalId > 0 && dto.LocalId != vendedor.LocalId.Value)
            {
                throw new InvalidOperationException(
                    $"Inconsistencia de sede: El colaborador '{vendedor.Nombre}' pertenece a la Sede #{vendedor.LocalId} ({vendedor.Local?.Nombre ?? "Sede Asignada"}). No se puede registrar un pago en la Sede #{dto.LocalId}.");
            }
            localEfectivo = vendedor.LocalId.Value;
        }

        var pago = new PagoEmpleado(
            localEfectivo,
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
