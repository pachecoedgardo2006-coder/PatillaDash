namespace PatillaDash.Domain.Entities;

public class RegistroVentaDiaria
{
    private readonly List<DetalleVentaDiaria> _detalles = new();
    private readonly List<ConsumoSuministroDiario> _consumos = new();

    public int Id { get; private set; }
    public int LocalId { get; private set; }
    public int VendedorId { get; private set; }
    public DateTime Fecha { get; private set; }
    public decimal TotalEfectivo { get; private set; }
    public decimal TotalTransferencia { get; private set; }
    public string? Notas { get; private set; }

    public Local Local { get; private set; } = null!;
    public Usuario Vendedor { get; private set; } = null!;
    public IReadOnlyCollection<DetalleVentaDiaria> Detalles => _detalles.AsReadOnly();
    public IReadOnlyCollection<ConsumoSuministroDiario> Consumos => _consumos.AsReadOnly();

    public decimal TotalVenta => TotalEfectivo + TotalTransferencia;

    private RegistroVentaDiaria() { }

    public RegistroVentaDiaria(int localId, int vendedorId, decimal totalEfectivo, decimal totalTransferencia, string? notas = null)
    {
        if (totalEfectivo < 0 || totalTransferencia < 0)
            throw new ArgumentException("Los montos de venta no pueden ser negativos.");

        if (totalEfectivo == 0 && totalTransferencia == 0)
            throw new InvalidOperationException("El registro debe contener al menos un monto de venta mayor a cero.");

        LocalId = localId;
        VendedorId = vendedorId;
        TotalEfectivo = totalEfectivo;
        TotalTransferencia = totalTransferencia;
        Notas = notas;
        Fecha = DateTime.UtcNow;
    }

    public void AgregarDetalle(int productoId, int cantidad, decimal precioUnitario)
    {
        var detalle = new DetalleVentaDiaria(productoId, cantidad, precioUnitario);
        _detalles.Add(detalle);
    }

    public void AgregarConsumo(int suministroId, decimal cantidadGastada)
    {
        var consumo = new ConsumoSuministroDiario(suministroId, cantidadGastada);
        _consumos.Add(consumo);
    }
}