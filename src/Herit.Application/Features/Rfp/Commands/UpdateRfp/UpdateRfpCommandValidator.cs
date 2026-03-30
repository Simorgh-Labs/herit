using FluentValidation;

namespace Herit.Application.Features.Rfp.Commands.UpdateRfp;

public class UpdateRfpCommandValidator : AbstractValidator<UpdateRfpCommand>
{
    public UpdateRfpCommandValidator()
    {
        RuleFor(x => x.Id).NotEqual(Guid.Empty);
        RuleFor(x => x.Title).NotEmpty().MaximumLength(256);
        RuleFor(x => x.ShortDescription).NotEmpty().MaximumLength(512);
        RuleFor(x => x.LongDescription).NotEmpty();
    }
}
