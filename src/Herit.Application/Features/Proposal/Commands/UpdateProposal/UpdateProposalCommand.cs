using MediatR;

namespace Herit.Application.Features.Proposal.Commands.UpdateProposal;

public record UpdateProposalCommand(
    Guid Id,
    string Title,
    string ShortDescription,
    string LongDescription) : IRequest<Unit>;

public class UpdateProposalCommandHandler : IRequestHandler<UpdateProposalCommand, Unit>
{
    public Task<Unit> Handle(UpdateProposalCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
