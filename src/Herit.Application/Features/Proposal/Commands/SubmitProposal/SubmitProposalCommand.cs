using MediatR;

namespace Herit.Application.Features.Proposal.Commands.SubmitProposal;

public record SubmitProposalCommand(Guid Id) : IRequest<Unit>;

public class SubmitProposalCommandHandler : IRequestHandler<SubmitProposalCommand, Unit>
{
    public Task<Unit> Handle(SubmitProposalCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
