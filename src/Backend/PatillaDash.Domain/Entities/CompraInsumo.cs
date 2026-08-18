namespace PatillaDash.Domain.Entities;

public class CompraInsumo
{
    public int Id { get; private set; }
    public int LocalId { get; private set; }
    public int SuministroId { get; private set; }
    public decimal Cantidad { get; private set; }
    public decimal CostoTotal { get; private set; }
    public DateTime Fecha { get; private set; }
    public string Proveedor { get; private set; } = string.Empty;

    public Local Local { get; private set; } = null!;
    public Suministro Suministro { get; private set; } = null!;

    private CompraInsumo() { }

    public CompraInsumo(int localId, int suministroId, decimal cantidad, decimal costoTotal, string proveedor)
    {
        if (cantidad <= 0) throw new ArgumentException("La cantidad comprada debe ser mayor a cero.");
        if (costoTotal <= 0) throw new ArgumentException("El costo total debe ser mayor a cero.");
        if (string.IsNullOrWhiteSpace(proveedor)) throw new ArgumentException("El nombre del proveedor es requerido.");

        LocalId = localId;
        SuministroId = suministroId;
        Cantidad = cantidad;
        CostoTotal = costoTotal;
        Proveedor = proveedor;
        Fecha = DateTime.UtcNow;
    }
}