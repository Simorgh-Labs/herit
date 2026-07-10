using Herit.Application.Authorization;
using Herit.Application.Interfaces;
using MediatR;

namespace Herit.Application.Features.Eoi.Queries.ListEoisByCfeoi;

public record ListEoisByCfeoiQuery(Guid CfeoiId) : IRequest<IEnumerable<Herit.Domain.Entities.Eoi>>;

public class ListEoisByCfeoiQueryHandler : IRequestHandler<ListEoisByCfeoiQuery, IEnumerable<Herit.Domain.Entities.Eoi>>
{
    private readonly IEoiRepository _eoiRepository;
    private readonly ICfeoiRepository _cfeoiRepository;
    private readonly IProposalRepository _proposalRepository;
    private readonly ICurrentUserService _currentUserService;

    public ListEoisByCfeoiQueryHandler(
        IEoiRepository eoiRepository,
        ICfeoiRepository cfeoiRepository,
        IProposalRepository proposalRepository,
        ICurrentUserService currentUserService)
    {
        _eoiRepository = eoiRepository;
        _cfeoiRepository = cfeoiRepository;
        _proposalRepository = proposalRepository;
        _currentUserService = currentUserService;
    }

    public async Task<IEnumerable<Herit.Domain.Entities.Eoi>> Handle(ListEoisByCfeoiQuery request, CancellationToken cancellationToken)
    {
        var user = await _currentUserService.GetCurrentUserOrNullAsync(cancellationToken);
        var eois = await _eoiRepository.ListByCfeoiAsync(request.CfeoiId, cancellationToken);

        // Resolve the parent proposal's owner so that Shared EOIs are surfaced to them.
        var cfeoi = await _cfeoiRepository.GetByIdAsync(request.CfeoiId, cancellationToken);
        var proposalOwnerId = Guid.Empty;
        if (cfeoi is not null)
        {
            var proposal = await _proposalRepository.GetByIdAsync(cfeoi.ProposalId, cancellationToken);
            proposalOwnerId = proposal?.AuthorId ?? Guid.Empty;
        }

        return eois.Where(e => VisibilityPolicy.CanViewEoi(e, user, proposalOwnerId)).ToList();
    }
}
