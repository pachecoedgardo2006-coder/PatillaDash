namespace PatillaDash.Application.DTOs.Compras;

public class CrearCompraDto
{
    public int LocalId { get; set; }
    public int SuministroId { get; set; }
    public decimal Cantidad { get; set; }
    public decimal CostoTotal { get; set; }
    public string Proveedor { get; set; } = string.Empty;
}