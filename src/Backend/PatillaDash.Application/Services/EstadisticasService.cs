using PatillaDash.Application.DTOs.Estadisticas;
using PatillaDash.Application.Interfaces;
using PatillaDash.Domain.Interfaces;

namespace PatillaDash.Application.Services;

public class EstadisticasService : IEstadisticasService
{
    private readonly IVentaRepository _ventaRepository;
    private readonly ICompraRepository _compraRepository;
    private readonly IPagoEmpleadoRepository _pagoRepository;

    public EstadisticasService(
        IVentaRepository ventaRepository,
        ICompraRepository compraRepository,
        IPagoEmpleadoRepository pagoRepository)
    {
        _ventaRepository = ventaRepository;
        _compraRepository = compraRepository;
        _pagoRepository = pagoRepository;
    }

    public async Task<DashboardEstadisticasDto> ObtenerDashboardGeneralAsync(DateTime? fechaInicio = null, DateTime? fechaFin = null)
    {
        var desde = fechaInicio ?? DateTime.UtcNow.AddMonths(-1);
        var hasta = fechaFin ?? DateTime.UtcNow;

        var ventas = await _ventaRepository.GetAllByDateRangeAsync(desde, hasta);
        var compras = await _compraRepository.GetAllByDateRangeAsync(desde, hasta);
        var pagos = await _pagoRepository.GetAllByDateRangeAsync(desde, hasta);

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
            RankingLocales = rankingLocales
        };
    }
}
