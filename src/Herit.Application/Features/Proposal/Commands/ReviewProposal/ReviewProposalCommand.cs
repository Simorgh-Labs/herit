using MediatR;

namespace Herit.Application.Features.Proposal.Commands.ReviewProposal;

public record ReviewProposalCommand(Guid Id) : IRequest<Unit>;

public class ReviewProposalCommandHandler : IRequestHandler<ReviewProposalCommand, Unit>
{
    public Task<Unit> Handle(ReviewProposalCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
