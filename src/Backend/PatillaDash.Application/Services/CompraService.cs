using PatillaDash.Application.DTOs.Compras;
using PatillaDash.Application.Interfaces;
using PatillaDash.Domain.Entities;
using PatillaDash.Domain.Interfaces;

namespace PatillaDash.Application.Services;

public class CompraService : ICompraService
{
    private readonly ICompraRepository _compraRepository;
    private readonly IInventarioRepository _inventarioRepository;

    public CompraService(ICompraRepository compraRepository, IInventarioRepository inventarioRepository)
    {
        _compraRepository = compraRepository;
        _inventarioRepository = inventarioRepository;
    }

    public async Task<CompraResumenDto> RegistrarCompraAsync(CrearCompraDto dto)
    {
        var compra = new CompraInsumo(
            dto.LocalId,
            dto.SuministroId,
            dto.Cantidad,
            dto.CostoTotal,
            dto.Proveedor
        );

        await _compraRepository.AddAsync(compra);

        var inventario = await _inventarioRepository.GetByLocalAndSuministroAsync(dto.LocalId, dto.SuministroId);
        if (inventario != null)
        {
            inventario.IncrementarStock(dto.Cantidad);
            await _inventarioRepository.UpdateAsync(inventario);
        }
        else
        {
            var nuevoInventario = new InventarioLocal(
                dto.LocalId,
                dto.SuministroId,
                dto.Cantidad
            );
            await _inventarioRepository.AddAsync(nuevoInventario);
        }

        return new CompraResumenDto
        {
            Id = compra.Id,
            LocalId = compra.LocalId,
            Cantidad = compra.Cantidad,
            CostoTotal = compra.CostoTotal,
            Fecha = compra.Fecha,
            Proveedor = compra.Proveedor
        };
    }

    public async Task<IEnumerable<CompraResumenDto>> ObtenerHistorialComprasAsync(int? localId = null)
    {
        IEnumerable<CompraInsumo> compras;

        if (localId.HasValue && localId.Value > 0)
        {
            compras = await _compraRepository.GetByLocalIdAsync(localId.Value);
        }
        else
        {
            var desde = DateTime.UtcNow.AddMonths(-1);
            var hasta = DateTime.UtcNow;
            compras = await _compraRepository.GetAllByDateRangeAsync(desde, hasta);
        }

        return compras.Select(c => new CompraResumenDto
        {
            Id = c.Id,
            LocalId = c.LocalId,
            NombreLocal = c.Local?.Nombre ?? string.Empty,
            NombreSuministro = c.Suministro?.Nombre ?? string.Empty,
            Cantidad = c.Cantidad,
            CostoTotal = c.CostoTotal,
            Fecha = c.Fecha,
            Proveedor = c.Proveedor
        });
    }
}