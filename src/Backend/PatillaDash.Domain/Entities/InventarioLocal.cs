namespace PatillaDash.Domain.Entities;

public class InventarioLocal
{
    public int Id { get; private set; }
    public int LocalId { get; private set; }
    public int SuministroId { get; private set; }
    public decimal CantidadDisponible { get; private set; }

    public Local Local { get; private set; } = null!;
    public Suministro Suministro { get; private set; } = null!;

    private InventarioLocal() { }

    public InventarioLocal(int localId, int suministroId, decimal cantidadInicial)
    {
        if (cantidadInicial < 0) 
            throw new ArgumentException("La cantidad inicial no puede ser negativa.");

        LocalId = localId;
        SuministroId = suministroId;
        CantidadDisponible = cantidadInicial;
    }

    public void DescontarStock(decimal cantidad)
    {
        if (cantidad <= 0) 
            throw new ArgumentException("La cantidad a descontar debe ser mayor a cero.");

        if (CantidadDisponible < cantidad)
            throw new InvalidOperationException($"Stock insuficiente. Disponible: {CantidadDisponible}, Requerido: {cantidad}");

        CantidadDisponible -= cantidad;
    }

    public void IncrementarStock(decimal cantidad)
    {
        if (cantidad <= 0) 
            throw new ArgumentException("La cantidad a incrementar debe ser mayor a cero.");

        CantidadDisponible += cantidad;
    }

    public bool RequiereAlertaStock(decimal stockMinimo)
    {
        return CantidadDisponible <= stockMinimo;
    }
}