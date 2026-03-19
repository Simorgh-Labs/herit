using Herit.Domain.Enums;
using MediatR;

namespace Herit.Application.Features.Proposal.Commands.SetProposalVisibility;

public record SetProposalVisibilityCommand(Guid Id, ProposalVisibility Visibility) : IRequest<Unit>;

public class SetProposalVisibilityCommandHandler : IRequestHandler<SetProposalVisibilityCommand, Unit>
{
    public Task<Unit> Handle(SetProposalVisibilityCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
