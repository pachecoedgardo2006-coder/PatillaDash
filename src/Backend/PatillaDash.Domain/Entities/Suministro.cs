using PatillaDash.Domain.Enums;

namespace PatillaDash.Domain.Entities;

public class Suministro
{
    public int Id { get; private set; }
    public string Nombre { get; private set; } = string.Empty;
    public UnidadMedida UnidadMedida { get; private set; }
    public decimal StockMinimoAlerta { get; private set; }

    private Suministro() { }

    public Suministro(string nombre, UnidadMedida unidadMedida, decimal stockMinimoAlerta)
    {
        if (string.IsNullOrWhiteSpace(nombre)) throw new ArgumentException("El nombre del suministro es requerido.");
        if (stockMinimoAlerta < 0) throw new ArgumentException("El stock mínimo no puede ser negativo.");

        Nombre = nombre;
        UnidadMedida = unidadMedida;
        StockMinimoAlerta = stockMinimoAlerta;
    }

    public void ActualizarStockMinimo(decimal nuevoMinimo)
    {
        if (nuevoMinimo < 0) throw new ArgumentException("El stock mínimo no puede ser negativo.");
        StockMinimoAlerta = nuevoMinimo;
    }
}