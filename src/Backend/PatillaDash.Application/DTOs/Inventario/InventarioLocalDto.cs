namespace PatillaDash.Application.DTOs.Inventario;

public class InventarioLocalDto
{
    public int SuministroId { get; set; }
    public string NombreSuministro { get; set; } = string.Empty;
    public string UnidadMedida { get; set; } = string.Empty;
    public decimal CantidadDisponible { get; set; }
    public decimal StockMinimoAlerta { get; set; }
    
    /// <summary>
    /// Indica si el stock actual está por debajo o igual al stock mínimo de alerta.
    /// </summary>
    public bool EnAlerta => CantidadDisponible <= StockMinimoAlerta;
}