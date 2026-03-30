using FluentValidation;

namespace Herit.Application.Features.Proposal.Commands.UpdateProposal;

public class UpdateProposalCommandValidator : AbstractValidator<UpdateProposalCommand>
{
    public UpdateProposalCommandValidator()
    {
        RuleFor(x => x.Id).NotEqual(Guid.Empty);
        RuleFor(x => x.Title).NotEmpty().MaximumLength(256);
        RuleFor(x => x.ShortDescription).NotEmpty().MaximumLength(512);
        RuleFor(x => x.LongDescription).NotEmpty();
    }
}
