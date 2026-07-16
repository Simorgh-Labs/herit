using Herit.Application.Authorization;
using Herit.Application.Exceptions;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using MediatR;

namespace Herit.Application.Features.Cfeoi.Commands.UpdateCfeoiStatus;

public record UpdateCfeoiStatusCommand(Guid Id, CfeoiStatus NewStatus) : IRequest<Unit>;

public class UpdateCfeoiStatusCommandHandler : IRequestHandler<UpdateCfeoiStatusCommand, Unit>
{
    private readonly ICfeoiRepository _repository;
    private readonly IProposalRepository _proposalRepository;
    private readonly ICurrentUserService _currentUserService;

    public UpdateCfeoiStatusCommandHandler(
        ICfeoiRepository repository,
        IProposalRepository proposalRepository,
        ICurrentUserService currentUserService)
    {
        _repository = repository;
        _proposalRepository = proposalRepository;
        _currentUserService = currentUserService;
    }

    public async Task<Unit> Handle(UpdateCfeoiStatusCommand request, CancellationToken cancellationToken)
    {
        var cfeoi = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (cfeoi is null)
            throw new NotFoundException($"Cfeoi '{request.Id}' does not exist.");

        var user = await _currentUserService.GetCurrentUserAsync(cancellationToken);
        var proposal = await _proposalRepository.GetByIdAsync(cfeoi.ProposalId, cancellationToken);
        if (proposal is null || !MutationPolicy.CanMutateCfeoi(proposal, user))
            throw new ForbiddenException("Only the owner of the parent proposal, or staff, may close this CFEOI.");

        cfeoi.TransitionStatus(request.NewStatus);
        await _repository.UpdateAsync(cfeoi, cancellationToken);
        return Unit.Value;
    }
}
