using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using MediatR;
using CfeoiEntity = Herit.Domain.Entities.Cfeoi;

namespace Herit.Application.Features.Cfeoi.Commands.PublishCfeoi;

public record PublishCfeoiCommand(
    string Title,
    string Description,
    CfeoiResourceType ResourceType,
    Guid ProposalId) : IRequest<Guid>;

public class PublishCfeoiCommandHandler : IRequestHandler<PublishCfeoiCommand, Guid>
{
    private readonly ICfeoiRepository _cfeoiRepository;
    private readonly IProposalRepository _proposalRepository;

    public PublishCfeoiCommandHandler(ICfeoiRepository cfeoiRepository, IProposalRepository proposalRepository)
    {
        _cfeoiRepository = cfeoiRepository;
        _proposalRepository = proposalRepository;
    }

    public async Task<Guid> Handle(PublishCfeoiCommand request, CancellationToken cancellationToken)
    {
        var proposal = await _proposalRepository.GetByIdAsync(request.ProposalId, cancellationToken);
        if (proposal is null)
            throw new InvalidOperationException($"Proposal '{request.ProposalId}' does not exist.");

        var id = Guid.NewGuid();
        var cfeoi = CfeoiEntity.Create(id, request.Title, request.Description, request.ResourceType, request.ProposalId);
        await _cfeoiRepository.AddAsync(cfeoi, cancellationToken);
        return id;
    }
}
