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
            registro.AgregarDetalle(d.ProductoId, d.CantidadVendida, d.Subtotal / d.CantidadVendida);
        }

        foreach (var c in dto.Consumos)
        {
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

        // Consultamos la entidad completa para retornar nombres de producto y suministro
        var ventaCreada = await _ventaRepository.GetByIdAsync(registro.Id);
        return ventaCreada != null ? MapearADto(ventaCreada) : new VentaResumenDto
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
        return ventas.Select(MapearADto);
    }

    public async Task<IEnumerable<VentaResumenDto>> ObtenerHistorialVentasAsync(int? localId = null)
    {
        var desde = DateTime.UtcNow.AddMonths(-1);
        var hasta = DateTime.UtcNow;

        IEnumerable<RegistroVentaDiaria> ventas;
        if (localId.HasValue && localId.Value > 0)
        {
            ventas = await _ventaRepository.GetByLocalAndDateRangeAsync(localId.Value, desde, hasta);
        }
        else
        {
            ventas = await _ventaRepository.GetAllByDateRangeAsync(desde, hasta);
        }

        return ventas.Select(MapearADto);
    }

    public async Task<VentaResumenDto?> ObtenerDetalleVentaAsync(int id)
    {
        var venta = await _ventaRepository.GetByIdAsync(id);
        return venta != null ? MapearADto(venta) : null;
    }

    private static VentaResumenDto MapearADto(RegistroVentaDiaria v)
    {
        return new VentaResumenDto
        {
            Id = v.Id,
            LocalId = v.LocalId,
            NombreLocal = v.Local?.Nombre ?? $"Local #{v.LocalId}",
            VendedorId = v.VendedorId,
            NombreVendedor = v.Vendedor?.Nombre ?? $"Vendedor #{v.VendedorId}",
            Fecha = v.Fecha,
            TotalEfectivo = v.TotalEfectivo,
            TotalTransferencia = v.TotalTransferencia,
            Notas = v.Notas,
            Detalles = v.Detalles.Select(d => new DetalleItemDto
            {
                ProductoId = d.ProductoId,
                NombreProducto = d.Producto?.Nombre ?? $"Producto #{d.ProductoId}",
                CantidadVendida = d.CantidadVendida,
                Subtotal = d.Subtotal
            }).ToList(),
            Consumos = v.Consumos.Select(c => new ConsumoItemDto
            {
                SuministroId = c.SuministroId,
                NombreSuministro = c.Suministro?.Nombre ?? $"Suministro #{c.SuministroId}",
                UnidadMedida = c.Suministro?.UnidadMedida.ToString() ?? "Unidades",
                CantidadGastada = c.CantidadGastada
            }).ToList()
        };
    }
}
