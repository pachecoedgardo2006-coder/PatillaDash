namespace PatillaDash.Domain.Entities;

public class ConsumoSuministroDiario
{
    public int Id { get; private set; }
    public int RegistroVentaDiariaId { get; private set; }
    public int SuministroId { get; private set; }
    public decimal CantidadGastada { get; private set; }

    public RegistroVentaDiaria RegistroVentaDiaria { get; private set; } = null!;
    public Suministro Suministro { get; private set; } = null!;

    private ConsumoSuministroDiario() { }

    internal ConsumoSuministroDiario(int suministroId, decimal cantidadGastada)
    {
        if (cantidadGastada <= 0) 
            throw new ArgumentException("La cantidad gastada debe ser mayor a cero.");

        SuministroId = suministroId;
        CantidadGastada = cantidadGastada;
    }
}