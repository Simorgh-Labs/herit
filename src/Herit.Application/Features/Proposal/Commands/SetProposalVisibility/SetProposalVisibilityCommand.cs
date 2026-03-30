using Herit.Application.Exceptions;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using MediatR;

namespace Herit.Application.Features.Proposal.Commands.SetProposalVisibility;

public record SetProposalVisibilityCommand(Guid Id, ProposalVisibility Visibility) : IRequest<Unit>;

public class SetProposalVisibilityCommandHandler : IRequestHandler<SetProposalVisibilityCommand, Unit>
{
    private readonly IProposalRepository _proposalRepository;

    public SetProposalVisibilityCommandHandler(IProposalRepository proposalRepository)
    {
        _proposalRepository = proposalRepository;
    }

    public async Task<Unit> Handle(SetProposalVisibilityCommand request, CancellationToken cancellationToken)
    {
        var proposal = await _proposalRepository.GetByIdAsync(request.Id, cancellationToken);
        if (proposal is null)
            throw new NotFoundException($"Proposal '{request.Id}' does not exist.");

        proposal.SetVisibility(request.Visibility);
        await _proposalRepository.UpdateAsync(proposal, cancellationToken);
        return Unit.Value;
    }
}
