namespace PatillaDash.Application.DTOs.Estadisticas;

public class DashboardEstadisticasDto
{
    public decimal TotalIngresos { get; set; }
    public decimal TotalGastosCompras { get; set; }
    public decimal TotalGastosNomina { get; set; }
    
    /// <summary>
    /// Balance neto calculado a partir de ingresos menos gastos totales.
    /// </summary>
    public decimal BalanceNeto { get; set; }
    
    /// <summary>
    /// Método de pago con mayor volumen registrado (ej. "Efectivo", "Transferencia", "Igualdad").
    /// </summary>
    public string MetodoPagoPredominante { get; set; } = string.Empty;

    public VentasPorMetodoPagoDto VentasMetodoPago { get; set; } = new();
    public List<RankingLocalDto> RankingLocales { get; set; } = new();
}