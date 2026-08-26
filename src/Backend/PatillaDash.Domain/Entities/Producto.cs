using System;

namespace PatillaDash.Domain.Entities;

public class Producto
{
    public int Id { get; private set; }
    public string Nombre { get; private set; } = string.Empty;
    public decimal PrecioBase { get; private set; }
    public string Categoria { get; private set; } = string.Empty;
    public bool Activo { get; private set; } = true;

    private Producto() { }

    public Producto(string nombre, decimal precioBase, string categoria, bool activo = true)
    {
        if (string.IsNullOrWhiteSpace(nombre)) throw new ArgumentException("El nombre del producto es requerido.");
        if (precioBase <= 0) throw new ArgumentException("El precio base debe ser mayor a cero.");

        Nombre = nombre.Trim();
        PrecioBase = precioBase;
        Categoria = string.IsNullOrWhiteSpace(categoria) ? "General" : categoria.Trim();
        Activo = activo;
    }

    public void Actualizar(string nombre, decimal nuevoPrecio, string categoria, bool activo)
    {
        if (string.IsNullOrWhiteSpace(nombre)) throw new ArgumentException("El nombre del producto es requerido.");
        if (nuevoPrecio <= 0) throw new ArgumentException("El precio debe ser mayor a cero.");

        Nombre = nombre.Trim();
        PrecioBase = nuevoPrecio;
        Categoria = string.IsNullOrWhiteSpace(categoria) ? "General" : categoria.Trim();
        Activo = activo;
    }

    public void ActualizarPrecio(decimal nuevoPrecio)
    {
        if (nuevoPrecio <= 0) throw new ArgumentException("El precio debe ser mayor a cero.");
        PrecioBase = nuevoPrecio;
    }

    public void ToggleActivo()
    {
        Activo = !Activo;
    }
}
