using Herit.Application.Authorization;
using Herit.Application.Exceptions;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using MediatR;

namespace Herit.Application.Features.Cfeoi.Commands.UpdateCfeoi;

public record UpdateCfeoiCommand(
    Guid Id,
    string Title,
    string Description,
    CfeoiResourceType ResourceType,
    string? Tags = null) : IRequest<Unit>;

public class UpdateCfeoiCommandHandler : IRequestHandler<UpdateCfeoiCommand, Unit>
{
    private readonly ICfeoiRepository _cfeoiRepository;
    private readonly IProposalRepository _proposalRepository;
    private readonly ICurrentUserService _currentUserService;

    public UpdateCfeoiCommandHandler(
        ICfeoiRepository cfeoiRepository,
        IProposalRepository proposalRepository,
        ICurrentUserService currentUserService)
    {
        _cfeoiRepository = cfeoiRepository;
        _proposalRepository = proposalRepository;
        _currentUserService = currentUserService;
    }

    public async Task<Unit> Handle(UpdateCfeoiCommand request, CancellationToken cancellationToken)
    {
        var cfeoi = await _cfeoiRepository.GetByIdAsync(request.Id, cancellationToken);
        if (cfeoi is null)
            throw new NotFoundException($"Cfeoi '{request.Id}' does not exist.");

        var user = await _currentUserService.GetCurrentUserAsync(cancellationToken);
        var proposal = await _proposalRepository.GetByIdAsync(cfeoi.ProposalId, cancellationToken);
        if (proposal is null || !MutationPolicy.CanMutateCfeoi(proposal, user))
            throw new ForbiddenException("Only the owner of the parent proposal, or staff, may update this CFEOI.");

        cfeoi.Update(
            request.Title,
            request.Description,
            request.ResourceType,
            request.Tags);

        await _cfeoiRepository.UpdateAsync(cfeoi, cancellationToken);
        return Unit.Value;
    }
}
