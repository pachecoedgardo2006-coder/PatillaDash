using FluentValidation;
using PatillaDash.Application.DTOs.Compras;

namespace PatillaDash.Application.Validators;

public class CrearCompraDtoValidator : AbstractValidator<CrearCompraDto>
{
    public CrearCompraDtoValidator()
    {
        RuleFor(x => x.LocalId).GreaterThan(0);
        RuleFor(x => x.SuministroId).GreaterThan(0);
        RuleFor(x => x.Cantidad).GreaterThan(0);
        RuleFor(x => x.CostoTotal).GreaterThan(0);
        RuleFor(x => x.Proveedor).NotEmpty().MaximumLength(150);
    }
}