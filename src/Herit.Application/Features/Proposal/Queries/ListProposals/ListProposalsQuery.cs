using Herit.Application.Authorization;
using Herit.Application.Interfaces;
using MediatR;

namespace Herit.Application.Features.Proposal.Queries.ListProposals;

public record ListProposalsQuery(Guid? RfpId = null) : IRequest<IEnumerable<Herit.Domain.Entities.Proposal>>;

public class ListProposalsQueryHandler : IRequestHandler<ListProposalsQuery, IEnumerable<Herit.Domain.Entities.Proposal>>
{
    private readonly IProposalRepository _proposalRepository;
    private readonly ICurrentUserService _currentUserService;

    public ListProposalsQueryHandler(IProposalRepository proposalRepository, ICurrentUserService currentUserService)
    {
        _proposalRepository = proposalRepository;
        _currentUserService = currentUserService;
    }

    public async Task<IEnumerable<Herit.Domain.Entities.Proposal>> Handle(ListProposalsQuery request, CancellationToken cancellationToken)
    {
        var user = await _currentUserService.GetCurrentUserOrNullAsync(cancellationToken);
        var proposals = await _proposalRepository.ListAsync(cancellationToken);

        var visible = proposals.Where(p => VisibilityPolicy.CanViewProposal(p, user));

        if (request.RfpId is not null)
            visible = visible.Where(p => p.RfpId == request.RfpId);

        return visible.ToList();
    }
}
