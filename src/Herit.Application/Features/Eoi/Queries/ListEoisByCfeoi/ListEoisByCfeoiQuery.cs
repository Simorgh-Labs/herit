using Herit.Application.Authorization;
using Herit.Application.Features.Eoi.Dtos;
using Herit.Application.Interfaces;
using MediatR;

namespace Herit.Application.Features.Eoi.Queries.ListEoisByCfeoi;

public record ListEoisByCfeoiQuery(Guid CfeoiId) : IRequest<IEnumerable<EoiResponseDto>>;

public class ListEoisByCfeoiQueryHandler : IRequestHandler<ListEoisByCfeoiQuery, IEnumerable<EoiResponseDto>>
{
    private readonly IEoiRepository _eoiRepository;
    private readonly ICfeoiRepository _cfeoiRepository;
    private readonly IProposalRepository _proposalRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUserService;

    public ListEoisByCfeoiQueryHandler(
        IEoiRepository eoiRepository,
        ICfeoiRepository cfeoiRepository,
        IProposalRepository proposalRepository,
        IUserRepository userRepository,
        ICurrentUserService currentUserService)
    {
        _eoiRepository = eoiRepository;
        _cfeoiRepository = cfeoiRepository;
        _proposalRepository = proposalRepository;
        _userRepository = userRepository;
        _currentUserService = currentUserService;
    }

    public async Task<IEnumerable<EoiResponseDto>> Handle(ListEoisByCfeoiQuery request, CancellationToken cancellationToken)
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

        var visibleEois = eois.Where(e => VisibilityPolicy.CanViewEoi(e, user, proposalOwnerId)).ToList();

        var submitterIds = visibleEois.Select(e => e.SubmittedById).Distinct();
        var submitters = (await _userRepository.ListByIdsAsync(submitterIds, cancellationToken))
            .ToDictionary(u => u.Id);

        var includeEmail = VisibilityPolicy.IsStaff(user);
        return visibleEois
            .Select(e => EoiResponseDto.From(e, submitters.GetValueOrDefault(e.SubmittedById), includeEmail))
            .ToList();
    }
}
