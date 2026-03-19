using MediatR;

namespace Herit.Application.Features.Proposal.Commands.DeleteProposal;

public record DeleteProposalCommand(Guid Id) : IRequest<Unit>;

public class DeleteProposalCommandHandler : IRequestHandler<DeleteProposalCommand, Unit>
{
    public Task<Unit> Handle(DeleteProposalCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
