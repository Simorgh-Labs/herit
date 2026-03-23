using MediatR;

namespace Herit.Application.Features.Proposal.Commands.CreateProposal;

public record CreateProposalCommand(
    string Title,
    string ShortDescription,
    Guid AuthorId,
    Guid OrganisationId,
    string LongDescription,
    Guid? RfpId = null) : IRequest<Guid>;

public class CreateProposalCommandHandler : IRequestHandler<CreateProposalCommand, Guid>
{
    public Task<Guid> Handle(CreateProposalCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
