using MediatR;

namespace Herit.Application.Features.Proposal.Commands.WithdrawProposal;

public record WithdrawProposalCommand(Guid Id) : IRequest<Unit>;

public class WithdrawProposalCommandHandler : IRequestHandler<WithdrawProposalCommand, Unit>
{
    public Task<Unit> Handle(WithdrawProposalCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
