using PatillaDash.Application.DTOs.Ventas;
using PatillaDash.Application.Interfaces;
using PatillaDash.Domain.Entities;
using PatillaDash.Domain.Interfaces;

namespace PatillaDash.Application.Services;

public class VentaService : IVentaService
{
    private readonly IVentaRepository _ventaRepository;
    private readonly IInventarioRepository _inventarioRepository;

    public VentaService(IVentaRepository ventaRepository, IInventarioRepository inventarioRepository)
    {
        _ventaRepository = ventaRepository;
        _inventarioRepository = inventarioRepository;
    }

    public async Task<VentaResumenDto> RegistrarVentaDiariaAsync(CrearVentaDiariaDto dto)
    {
        var registro = new RegistroVentaDiaria(
            dto.LocalId,
            dto.VendedorId,
            dto.TotalEfectivo,
            dto.TotalTransferencia,
            dto.Notas
        );

        foreach (var d in dto.Detalles)
        {
            // Usamos el método del agregador pasando precioUnitario
            // (puedes pasar d.PrecioUnitario o calcularlo como d.Subtotal / d.CantidadVendida)
            registro.AgregarDetalle(d.ProductoId, d.CantidadVendida, d.Subtotal / d.CantidadVendida);
        }

        foreach (var c in dto.Consumos)
        {
            // Usamos el método del agregador directamente
            registro.AgregarConsumo(c.SuministroId, c.CantidadGastada);
        }

        await _ventaRepository.AddAsync(registro);

        foreach (var consumo in dto.Consumos)
        {
            var inventario = await _inventarioRepository.GetByLocalAndSuministroAsync(dto.LocalId, consumo.SuministroId);
            if (inventario != null)
            {
                inventario.DescontarStock(consumo.CantidadGastada);
                await _inventarioRepository.UpdateAsync(inventario);
            }
        }

        return new VentaResumenDto
        {
            Id = registro.Id,
            LocalId = registro.LocalId,
            VendedorId = registro.VendedorId,
            Fecha = registro.Fecha,
            TotalEfectivo = registro.TotalEfectivo,
            TotalTransferencia = registro.TotalTransferencia,
            Notas = registro.Notas
        };
    }

    public async Task<IEnumerable<VentaResumenDto>> ObtenerVentasPorLocalAsync(int localId)
    {
        var desde = DateTime.UtcNow.AddMonths(-1);
        var hasta = DateTime.UtcNow;

        var ventas = await _ventaRepository.GetByLocalAndDateRangeAsync(localId, desde, hasta);
        
        return ventas.Select(v => new VentaResumenDto
        {
            Id = v.Id,
            LocalId = v.LocalId,
            VendedorId = v.VendedorId,
            Fecha = v.Fecha,
            TotalEfectivo = v.TotalEfectivo,
            TotalTransferencia = v.TotalTransferencia,
            Notas = v.Notas
        });
    }
}