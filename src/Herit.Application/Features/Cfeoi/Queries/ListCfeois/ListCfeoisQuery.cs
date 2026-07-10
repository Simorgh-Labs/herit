using Herit.Application.Authorization;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using MediatR;

namespace Herit.Application.Features.Cfeoi.Queries.ListCfeois;

public record ListCfeoisQuery(CfeoiStatus? Status = null, Guid? ProposalId = null) : IRequest<IEnumerable<Herit.Domain.Entities.Cfeoi>>;

public class ListCfeoisQueryHandler : IRequestHandler<ListCfeoisQuery, IEnumerable<Herit.Domain.Entities.Cfeoi>>
{
    private readonly ICfeoiRepository _cfeoiRepository;
    private readonly IProposalRepository _proposalRepository;
    private readonly ICurrentUserService _currentUserService;

    public ListCfeoisQueryHandler(
        ICfeoiRepository cfeoiRepository,
        IProposalRepository proposalRepository,
        ICurrentUserService currentUserService)
    {
        _cfeoiRepository = cfeoiRepository;
        _proposalRepository = proposalRepository;
        _currentUserService = currentUserService;
    }

    public async Task<IEnumerable<Herit.Domain.Entities.Cfeoi>> Handle(ListCfeoisQuery request, CancellationToken cancellationToken)
    {
        var user = await _currentUserService.GetCurrentUserOrNullAsync(cancellationToken);
        var cfeois = await _cfeoiRepository.ListAsync(request.Status, request.ProposalId, cancellationToken);

        // A CFEOI inherits its parent proposal's visibility, so it is only visible when
        // the caller is permitted to see that proposal.
        var proposals = await _proposalRepository.ListAsync(cancellationToken);
        var visibleProposalIds = proposals
            .Where(p => VisibilityPolicy.CanViewProposal(p, user))
            .Select(p => p.Id)
            .ToHashSet();

        return cfeois.Where(c => visibleProposalIds.Contains(c.ProposalId)).ToList();
    }
}
