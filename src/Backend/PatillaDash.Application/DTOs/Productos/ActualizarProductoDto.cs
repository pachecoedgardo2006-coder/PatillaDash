namespace PatillaDash.Application.DTOs.Productos;

public record ActualizarProductoDto(
    string Nombre,
    decimal PrecioBase,
    string Categoria,
    bool Activo
);
