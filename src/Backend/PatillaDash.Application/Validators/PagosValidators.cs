using FluentValidation;
using PatillaDash.Application.DTOs.Pagos;

namespace PatillaDash.Application.Validators;

public class RegistrarPagoDtoValidator : AbstractValidator<RegistrarPagoDto>
{
    public RegistrarPagoDtoValidator()
    {
        RuleFor(x => x.LocalId).GreaterThan(0);
        RuleFor(x => x.VendedorId).GreaterThan(0);
        RuleFor(x => x.Monto).GreaterThan(0);
    }
}