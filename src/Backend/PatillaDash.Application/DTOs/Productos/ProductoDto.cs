namespace PatillaDash.Application.DTOs.Productos;

public record ProductoDto(
    int Id,
    string Nombre,
    decimal PrecioBase,
    string Categoria,
    bool Activo
);
