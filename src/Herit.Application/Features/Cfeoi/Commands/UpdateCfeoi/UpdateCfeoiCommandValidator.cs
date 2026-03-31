using FluentValidation;

namespace Herit.Application.Features.Cfeoi.Commands.UpdateCfeoi;

public class UpdateCfeoiCommandValidator : AbstractValidator<UpdateCfeoiCommand>
{
    public UpdateCfeoiCommandValidator()
    {
        RuleFor(x => x.Id).NotEqual(Guid.Empty);
        RuleFor(x => x.Title).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Description).NotEmpty();
        RuleFor(x => x.RoleTitle).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Skills).NotEmpty().MaximumLength(1024);
        RuleFor(x => x.Slots).GreaterThan(0);
    }
}
