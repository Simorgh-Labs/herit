using FluentValidation;

namespace Herit.Application.Features.Cfeoi.Commands.PublishCfeoi;

public class PublishCfeoiCommandValidator : AbstractValidator<PublishCfeoiCommand>
{
    public PublishCfeoiCommandValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Description).NotEmpty();
        RuleFor(x => x.ProposalId).NotEqual(Guid.Empty);
    }
}
