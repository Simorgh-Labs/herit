using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using MediatR;

namespace Herit.Application.Features.Proposal.Commands.UpdateProposalStatus;

public record UpdateProposalStatusCommand(Guid Id, ProposalStatus NewStatus) : IRequest<Unit>;

public class UpdateProposalStatusCommandHandler : IRequestHandler<UpdateProposalStatusCommand, Unit>
{
    private readonly IProposalRepository _proposalRepository;

    public UpdateProposalStatusCommandHandler(IProposalRepository proposalRepository)
    {
        _proposalRepository = proposalRepository;
    }

    public async Task<Unit> Handle(UpdateProposalStatusCommand request, CancellationToken cancellationToken)
    {
        var proposal = await _proposalRepository.GetByIdAsync(request.Id, cancellationToken);
        if (proposal is null)
            throw new InvalidOperationException($"Proposal '{request.Id}' does not exist.");

        proposal.TransitionStatus(request.NewStatus);
        await _proposalRepository.UpdateAsync(proposal, cancellationToken);
        return Unit.Value;
    }
}
