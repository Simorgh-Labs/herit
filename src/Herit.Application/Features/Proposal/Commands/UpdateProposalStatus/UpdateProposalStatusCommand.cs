using Herit.Application.Authorization;
using Herit.Application.Exceptions;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using MediatR;

namespace Herit.Application.Features.Proposal.Commands.UpdateProposalStatus;

public record UpdateProposalStatusCommand(Guid Id, ProposalStatus NewStatus) : IRequest<Unit>;

public class UpdateProposalStatusCommandHandler : IRequestHandler<UpdateProposalStatusCommand, Unit>
{
    private readonly IProposalRepository _proposalRepository;
    private readonly ICurrentUserService _currentUserService;

    public UpdateProposalStatusCommandHandler(IProposalRepository proposalRepository, ICurrentUserService currentUserService)
    {
        _proposalRepository = proposalRepository;
        _currentUserService = currentUserService;
    }

    public async Task<Unit> Handle(UpdateProposalStatusCommand request, CancellationToken cancellationToken)
    {
        var proposal = await _proposalRepository.GetByIdAsync(request.Id, cancellationToken);
        if (proposal is null)
            throw new NotFoundException($"Proposal '{request.Id}' does not exist.");

        var user = await _currentUserService.GetCurrentUserAsync(cancellationToken);
        if (!MutationPolicy.CanTransitionProposalStatus(proposal, user, request.NewStatus))
            throw new ForbiddenException("You are not permitted to move this proposal to the requested status.");

        proposal.TransitionStatus(request.NewStatus);
        await _proposalRepository.UpdateAsync(proposal, cancellationToken);
        return Unit.Value;
    }
}
