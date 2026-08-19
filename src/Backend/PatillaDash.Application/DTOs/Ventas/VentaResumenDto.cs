namespace PatillaDash.Application.DTOs.Ventas;

public class VentaResumenDto
{
    public int Id { get; set; }
    public int LocalId { get; set; }
    public string NombreLocal { get; set; } = string.Empty;
    public int VendedorId { get; set; }
    public string NombreVendedor { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
    public decimal TotalEfectivo { get; set; }
    public decimal TotalTransferencia { get; set; }
    public decimal TotalGeneral => TotalEfectivo + TotalTransferencia;
    public string? Notas { get; set; }
}