namespace PatillaDash.Application.DTOs.Estadisticas;

public class DashboardEstadisticasDto
{
    public decimal TotalIngresos { get; set; }
    public decimal TotalGastosCompras { get; set; }
    public decimal TotalGastosNomina { get; set; }
    public decimal GananciaNeta => TotalIngresos - (TotalGastosCompras + TotalGastosNomina);
    public VentasPorMetodoPagoDto VentasMetodoPago { get; set; } = new();
    public List<RankingLocalDto> RankingLocales { get; set; } = new();
}


public class RankingLocalDto
{
    public int LocalId { get; set; }
    public string NombreLocal { get; set; } = string.Empty;
    public decimal TotalVentas { get; set; }
}