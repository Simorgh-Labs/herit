using FluentValidation;

namespace Herit.Application.Features.Eoi.Commands.SubmitEoi;

public class SubmitEoiCommandValidator : AbstractValidator<SubmitEoiCommand>
{
    public SubmitEoiCommandValidator()
    {
        RuleFor(x => x.Message).NotEmpty();
        RuleFor(x => x.CfeoiId).NotEqual(Guid.Empty);
    }
}
