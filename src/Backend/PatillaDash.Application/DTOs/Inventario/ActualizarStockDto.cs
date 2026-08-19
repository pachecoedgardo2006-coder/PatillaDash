namespace PatillaDash.Application.DTOs.Inventario;

public class ActualizarStockDto
{
    public int LocalId { get; set; }
    public int SuministroId { get; set; }
    public decimal NuevaCantidad { get; set; }
}