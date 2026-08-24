using PatillaDash.Application.DTOs.Estadisticas;
using PatillaDash.Application.Interfaces;
using PatillaDash.Domain.Interfaces;

namespace PatillaDash.Application.Services;

public class EstadisticasService : IEstadisticasService
{
    private readonly IVentaRepository _ventaRepository;
    private readonly ICompraRepository _compraRepository;
    private readonly IPagoEmpleadoRepository _pagoRepository;
    private readonly IInventarioRepository _inventarioRepository;

    public EstadisticasService(
        IVentaRepository ventaRepository,
        ICompraRepository compraRepository,
        IPagoEmpleadoRepository pagoRepository,
        IInventarioRepository inventarioRepository)
    {
        _ventaRepository = ventaRepository;
        _compraRepository = compraRepository;
        _pagoRepository = pagoRepository;
        _inventarioRepository = inventarioRepository;
    }

    public async Task<DashboardEstadisticasDto> ObtenerDashboardGeneralAsync(DateTime? fechaInicio = null, DateTime? fechaFin = null)
    {
        var desde = fechaInicio ?? DateTime.UtcNow.AddMonths(-1);
        var hasta = fechaFin ?? DateTime.UtcNow;

        var ventas = await _ventaRepository.GetAllByDateRangeAsync(desde, hasta);
        var compras = await _compraRepository.GetAllByDateRangeAsync(desde, hasta);
        var pagos = await _pagoRepository.GetAllByDateRangeAsync(desde, hasta);
        var inventarios = await _inventarioRepository.GetAllAsync();

        decimal totalEfectivo = ventas.Sum(v => v.TotalEfectivo);
        decimal totalTransferencia = ventas.Sum(v => v.TotalTransferencia);
        decimal totalIngresos = totalEfectivo + totalTransferencia;

        decimal totalGastosCompras = compras.Sum(c => c.CostoTotal);
        decimal totalGastosNomina = pagos.Sum(p => p.Monto);
        decimal balanceNeto = totalIngresos - (totalGastosCompras + totalGastosNomina);

        string metodoPredominante = totalEfectivo > totalTransferencia 
            ? "Efectivo" 
            : totalTransferencia > totalEfectivo 
                ? "Transferencia" 
                : "Igualdad";

        var rankingLocales = ventas
            .GroupBy(v => new { v.LocalId, Nombre = v.Local?.Nombre ?? "Sin Local" })
            .Select(g => new RankingLocalDto
            {
                LocalId = g.Key.LocalId,
                NombreLocal = g.Key.Nombre,
                TotalVentas = g.Sum(v => v.TotalEfectivo + v.TotalTransferencia)
            })
            .OrderByDescending(r => r.TotalVentas)
            .ToList();

        var insumosEnAlerta = inventarios
            .Where(i => i.Suministro != null && i.CantidadDisponible <= i.Suministro.StockMinimoAlerta)
            .Select(i => new AlertaStockDto
            {
                LocalId = i.LocalId,
                NombreLocal = i.Local?.Nombre ?? $"Local #{i.LocalId}",
                SuministroId = i.SuministroId,
                NombreSuministro = i.Suministro?.Nombre ?? $"Suministro #{i.SuministroId}",
                UnidadMedida = i.Suministro?.UnidadMedida.ToString() ?? "Unidades",
                CantidadDisponible = i.CantidadDisponible,
                StockMinimoAlerta = i.Suministro?.StockMinimoAlerta ?? 0
            })
            .ToList();

        return new DashboardEstadisticasDto
        {
            TotalIngresos = totalIngresos,
            TotalGastosCompras = totalGastosCompras,
            TotalGastosNomina = totalGastosNomina,
            BalanceNeto = balanceNeto,
            MetodoPagoPredominante = metodoPredominante,
            VentasMetodoPago = new VentasPorMetodoPagoDto
            {
                TotalEfectivo = totalEfectivo,
                TotalTransferencia = totalTransferencia
            },
            RankingLocales = rankingLocales,
            InsumosEnAlerta = insumosEnAlerta
        };
    }
}
