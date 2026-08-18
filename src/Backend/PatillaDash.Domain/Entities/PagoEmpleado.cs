namespace PatillaDash.Domain.Entities;

public class PagoEmpleado
{
    public int Id { get; private set; }
    public int LocalId { get; private set; }
    public int VendedorId { get; private set; }
    public decimal Monto { get; private set; }
    public DateTime FechaPago { get; private set; }
    public string? Observacion { get; private set; }

    public Local Local { get; private set; } = null!;
    public Usuario Vendedor { get; private set; } = null!;

    private PagoEmpleado() { }

    public PagoEmpleado(int localId, int vendedorId, decimal monto, string? observacion = null)
    {
        if (monto <= 0) throw new ArgumentException("El monto a pagar debe ser mayor a cero.");

        LocalId = localId;
        VendedorId = vendedorId;
        Monto = monto;
        Observacion = observacion;
        FechaPago = DateTime.UtcNow;
    }
}