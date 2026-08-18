namespace PatillaDash.Domain.Entities;

public class DetalleVentaDiaria
{
    public int Id { get; private set; }
    public int RegistroVentaDiariaId { get; private set; }
    public int ProductoId { get; private set; }
    public int CantidadVendida { get; private set; }
    public decimal Subtotal { get; private set; }

    public RegistroVentaDiaria RegistroVentaDiaria { get; private set; } = null!;
    public Producto Producto { get; private set; } = null!;

    private DetalleVentaDiaria() { }

    internal DetalleVentaDiaria(int productoId, int cantidad, decimal precioUnitario)
    {
        if (cantidad <= 0) throw new ArgumentException("La cantidad vendida debe ser mayor a cero.");
        if (precioUnitario <= 0) throw new ArgumentException("El precio unitario debe ser mayor a cero.");

        ProductoId = productoId;
        CantidadVendida = cantidad;
        Subtotal = cantidad * precioUnitario;
    }
}