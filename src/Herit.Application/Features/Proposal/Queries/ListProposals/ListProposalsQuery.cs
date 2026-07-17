using Herit.Application.Authorization;
using Herit.Application.Features.Proposal.Dtos;
using Herit.Application.Interfaces;
using MediatR;

namespace Herit.Application.Features.Proposal.Queries.ListProposals;

public record ListProposalsQuery(Guid? RfpId = null) : IRequest<IEnumerable<ProposalResponseDto>>;

public class ListProposalsQueryHandler : IRequestHandler<ListProposalsQuery, IEnumerable<ProposalResponseDto>>
{
    private readonly IProposalRepository _proposalRepository;
    private readonly IUserRepository _userRepository;
    private readonly IOrganisationRepository _organisationRepository;
    private readonly ICurrentUserService _currentUserService;

    public ListProposalsQueryHandler(
        IProposalRepository proposalRepository,
        IUserRepository userRepository,
        IOrganisationRepository organisationRepository,
        ICurrentUserService currentUserService)
    {
        _proposalRepository = proposalRepository;
        _userRepository = userRepository;
        _organisationRepository = organisationRepository;
        _currentUserService = currentUserService;
    }

    public async Task<IEnumerable<ProposalResponseDto>> Handle(ListProposalsQuery request, CancellationToken cancellationToken)
    {
        var user = await _currentUserService.GetCurrentUserOrNullAsync(cancellationToken);
        var proposals = await _proposalRepository.ListAsync(cancellationToken);

        var visible = proposals.Where(p => VisibilityPolicy.CanViewProposal(p, user));

        if (request.RfpId is not null)
            visible = visible.Where(p => p.RfpId == request.RfpId);

        var visibleList = visible.ToList();

        var authors = (await _userRepository.ListByIdsAsync(visibleList.Select(p => p.AuthorId).Distinct(), cancellationToken))
            .ToDictionary(u => u.Id);
        var organisations = (await _organisationRepository.ListAsync(cancellationToken))
            .ToDictionary(o => o.Id);

        return visibleList
            .Select(p => ProposalResponseDto.From(p, authors.GetValueOrDefault(p.AuthorId), organisations.GetValueOrDefault(p.OrganisationId)))
            .ToList();
    }
}
