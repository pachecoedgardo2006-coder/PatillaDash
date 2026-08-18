namespace PatillaDash.Domain.Entities;

public class Producto
{
    public int Id { get; private set; }
    public string Nombre { get; private set; } = string.Empty;
    public decimal PrecioBase { get; private set; }
    public string Categoria { get; private set; } = string.Empty;

    private Producto() { }

    public Producto(string nombre, decimal precioBase, string categoria)
    {
        if (string.IsNullOrWhiteSpace(nombre)) throw new ArgumentException("El nombre del producto es requerido.");
        if (precioBase <= 0) throw new ArgumentException("El precio base debe ser mayor a cero.");

        Nombre = nombre;
        PrecioBase = precioBase;
        Categoria = categoria;
    }

    public void ActualizarPrecio(decimal nuevoPrecio)
    {
        if (nuevoPrecio <= 0) throw new ArgumentException("El precio debe ser mayor a cero.");
        PrecioBase = nuevoPrecio;
    }
}