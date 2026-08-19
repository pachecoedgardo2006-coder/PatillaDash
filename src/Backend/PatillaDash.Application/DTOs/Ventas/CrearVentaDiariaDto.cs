namespace PatillaDash.Application.DTOs.Ventas;

public class CrearVentaDiariaDto
{
    public int LocalId { get; set; }
    public int VendedorId { get; set; }
    public decimal TotalEfectivo { get; set; }
    public decimal TotalTransferencia { get; set; }
    public string? Notas { get; set; }
    public List<DetalleVentaDto> Detalles { get; set; } = new();
    public List<ConsumoDto> Consumos { get; set; } = new();
}