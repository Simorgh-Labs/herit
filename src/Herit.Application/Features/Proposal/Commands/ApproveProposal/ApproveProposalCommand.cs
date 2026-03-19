using MediatR;

namespace Herit.Application.Features.Proposal.Commands.ApproveProposal;

public record ApproveProposalCommand(Guid Id) : IRequest<Unit>;

public class ApproveProposalCommandHandler : IRequestHandler<ApproveProposalCommand, Unit>
{
    public Task<Unit> Handle(ApproveProposalCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
