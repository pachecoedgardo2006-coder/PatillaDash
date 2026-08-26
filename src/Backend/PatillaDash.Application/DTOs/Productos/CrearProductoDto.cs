namespace PatillaDash.Application.DTOs.Productos;

public record CrearProductoDto(
    string Nombre,
    decimal PrecioBase,
    string Categoria
);
