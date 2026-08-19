namespace PatillaDash.Application.DTOs.Inventario;

public class InventarioLocalDto
{
    public int SuministroId { get; set; }
    public string NombreSuministro { get; set; } = string.Empty;
    public string UnidadMedida { get; set; } = string.Empty;
    public decimal CantidadDisponible { get; set; }
    public decimal StockMinimoAlerta { get; set; }
    public bool RequiereReabastecimiento => CantidadDisponible <= StockMinimoAlerta;
}