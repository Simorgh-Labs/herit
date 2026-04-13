using FluentValidation;

namespace Herit.Application.Features.Cfeoi.Commands.UpdateCfeoi;

public class UpdateCfeoiCommandValidator : AbstractValidator<UpdateCfeoiCommand>
{
    public UpdateCfeoiCommandValidator()
    {
        RuleFor(x => x.Id).NotEqual(Guid.Empty);
        RuleFor(x => x.Title).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Description).NotEmpty();
    }
}
