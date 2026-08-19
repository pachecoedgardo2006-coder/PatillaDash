using FluentValidation;
using PatillaDash.Application.DTOs.Ventas;

namespace PatillaDash.Application.Validators;

public class CrearVentaDiariaDtoValidator : AbstractValidator<CrearVentaDiariaDto>
{
    public CrearVentaDiariaDtoValidator()
    {
        RuleFor(x => x.LocalId).GreaterThan(0);
        RuleFor(x => x.VendedorId).GreaterThan(0);
        RuleFor(x => x.TotalEfectivo).GreaterThanOrEqualTo(0);
        RuleFor(x => x.TotalTransferencia).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Detalles).NotEmpty().WithMessage("Debe incluir al menos un detalle de producto.");
    }
}