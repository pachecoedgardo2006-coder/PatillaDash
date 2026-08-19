namespace PatillaDash.Application.DTOs.Pagos;

public class RegistrarPagoDto
{
    public int LocalId { get; set; }
    public int VendedorId { get; set; }
    public decimal Monto { get; set; }
    public string? Observacion { get; set; }
}