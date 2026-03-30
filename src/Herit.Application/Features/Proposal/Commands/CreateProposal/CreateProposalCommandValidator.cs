using FluentValidation;

namespace Herit.Application.Features.Proposal.Commands.CreateProposal;

public class CreateProposalCommandValidator : AbstractValidator<CreateProposalCommand>
{
    public CreateProposalCommandValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(256);
        RuleFor(x => x.ShortDescription).NotEmpty().MaximumLength(512);
        RuleFor(x => x.LongDescription).NotEmpty();
        RuleFor(x => x.AuthorId).NotEqual(Guid.Empty);
        RuleFor(x => x.OrganisationId).NotEqual(Guid.Empty);
        RuleFor(x => x.RfpId).NotEqual(Guid.Empty).When(x => x.RfpId.HasValue);
    }
}
