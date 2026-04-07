using FluentValidation;

namespace Herit.Application.Features.Rfp.Commands.CreateRfp;

public class CreateRfpCommandValidator : AbstractValidator<CreateRfpCommand>
{
    public CreateRfpCommandValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(256);
        RuleFor(x => x.ShortDescription).NotEmpty().MaximumLength(512);
        RuleFor(x => x.LongDescription).NotEmpty();
        RuleFor(x => x.OrganisationId).NotEqual(Guid.Empty);
    }
}
