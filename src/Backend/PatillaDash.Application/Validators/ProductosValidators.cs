using FluentValidation;
using PatillaDash.Application.DTOs.Productos;

namespace PatillaDash.Application.Validators;

public class CrearProductoDtoValidator : AbstractValidator<CrearProductoDto>
{
    public CrearProductoDtoValidator()
    {
        RuleFor(x => x.Nombre)
            .NotEmpty().WithMessage("El nombre del producto es obligatorio.")
            .MaximumLength(100).WithMessage("El nombre no puede superar los 100 caracteres.");

        RuleFor(x => x.PrecioBase)
            .GreaterThan(0).WithMessage("El precio de venta debe ser mayor a $0.");

        RuleFor(x => x.Categoria)
            .MaximumLength(100).WithMessage("La categoría no puede superar los 100 caracteres.");
    }
}

public class ActualizarProductoDtoValidator : AbstractValidator<ActualizarProductoDto>
{
    public ActualizarProductoDtoValidator()
    {
        RuleFor(x => x.Nombre)
            .NotEmpty().WithMessage("El nombre del producto es obligatorio.")
            .MaximumLength(100).WithMessage("El nombre no puede superar los 100 caracteres.");

        RuleFor(x => x.PrecioBase)
            .GreaterThan(0).WithMessage("El precio de venta debe ser mayor a $0.");

        RuleFor(x => x.Categoria)
            .MaximumLength(100).WithMessage("La categoría no puede superar los 100 caracteres.");
    }
}
