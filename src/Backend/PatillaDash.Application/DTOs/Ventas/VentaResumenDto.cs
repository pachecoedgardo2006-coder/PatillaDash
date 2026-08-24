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

    public List<DetalleItemDto> Detalles { get; set; } = new();
    public List<ConsumoItemDto> Consumos { get; set; } = new();
}

public class DetalleItemDto
{
    public int ProductoId { get; set; }
    public string NombreProducto { get; set; } = string.Empty;
    public int CantidadVendida { get; set; }
    public decimal Subtotal { get; set; }
}

public class ConsumoItemDto
{
    public int SuministroId { get; set; }
    public string NombreSuministro { get; set; } = string.Empty;
    public string UnidadMedida { get; set; } = string.Empty;
    public decimal CantidadGastada { get; set; }
}
