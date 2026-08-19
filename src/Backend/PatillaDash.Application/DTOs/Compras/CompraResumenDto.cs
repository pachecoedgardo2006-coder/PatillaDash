namespace PatillaDash.Application.DTOs.Compras;

public class CompraResumenDto
{
    public int Id { get; set; }
    public int LocalId { get; set; }
    public string NombreLocal { get; set; } = string.Empty;
    public string NombreSuministro { get; set; } = string.Empty;
    public decimal Cantidad { get; set; }
    public decimal CostoTotal { get; set; }
    public DateTime Fecha { get; set; }
    public string Proveedor { get; set; } = string.Empty;
}