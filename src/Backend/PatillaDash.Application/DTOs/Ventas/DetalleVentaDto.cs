namespace PatillaDash.Application.DTOs.Ventas;
public class DetalleVentaDto
{
    public int ProductoId { get; set; }
    public int CantidadVendida { get; set; }
    public decimal Subtotal { get; set; }
}