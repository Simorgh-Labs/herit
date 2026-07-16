using Herit.Application.Authorization;
using Herit.Application.Exceptions;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using MediatR;
using CfeoiEntity = Herit.Domain.Entities.Cfeoi;

namespace Herit.Application.Features.Cfeoi.Commands.PublishCfeoi;

public record PublishCfeoiCommand(
    string Title,
    string Description,
    CfeoiResourceType ResourceType,
    Guid ProposalId,
    string? Tags = null) : IRequest<Guid>;

public class PublishCfeoiCommandHandler : IRequestHandler<PublishCfeoiCommand, Guid>
{
    private readonly ICfeoiRepository _cfeoiRepository;
    private readonly IProposalRepository _proposalRepository;
    private readonly ICurrentUserService _currentUserService;

    public PublishCfeoiCommandHandler(
        ICfeoiRepository cfeoiRepository,
        IProposalRepository proposalRepository,
        ICurrentUserService currentUserService)
    {
        _cfeoiRepository = cfeoiRepository;
        _proposalRepository = proposalRepository;
        _currentUserService = currentUserService;
    }

    public async Task<Guid> Handle(PublishCfeoiCommand request, CancellationToken cancellationToken)
    {
        var proposal = await _proposalRepository.GetByIdAsync(request.ProposalId, cancellationToken);
        if (proposal is null)
            throw new NotFoundException($"Proposal '{request.ProposalId}' does not exist.");

        var user = await _currentUserService.GetCurrentUserAsync(cancellationToken);
        if (!MutationPolicy.CanMutateCfeoi(proposal, user))
            throw new ForbiddenException("Only the owner of this proposal, or staff, may publish a CFEOI under it.");

        var id = Guid.NewGuid();
        var cfeoi = CfeoiEntity.Create(
            id,
            request.Title,
            request.Description,
            request.ResourceType,
            request.ProposalId,
            request.Tags);
        await _cfeoiRepository.AddAsync(cfeoi, cancellationToken);
        return id;
    }
}
