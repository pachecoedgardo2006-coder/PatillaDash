namespace PatillaDash.Application.DTOs.Pagos;

public class PagoResumenDto
{
    public int Id { get; set; }
    public int LocalId { get; set; }
    public string NombreLocal { get; set; } = string.Empty;
    public int VendedorId { get; set; }
    public string NombreVendedor { get; set; } = string.Empty;
    public decimal Monto { get; set; }
    public DateTime FechaPago { get; set; }
    public DateTime Fecha => FechaPago;
    public string? Observacion { get; set; }
}
