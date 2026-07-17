using Herit.Application.Authorization;
using Herit.Application.Features.Rfp.Dtos;
using Herit.Application.Interfaces;
using MediatR;

namespace Herit.Application.Features.Rfp.Queries.ListRfps;

public record ListRfpsQuery() : IRequest<IEnumerable<RfpResponseDto>>;

public class ListRfpsQueryHandler : IRequestHandler<ListRfpsQuery, IEnumerable<RfpResponseDto>>
{
    private readonly IRfpRepository _repository;
    private readonly IUserRepository _userRepository;
    private readonly IOrganisationRepository _organisationRepository;
    private readonly ICurrentUserService _currentUserService;

    public ListRfpsQueryHandler(
        IRfpRepository repository,
        IUserRepository userRepository,
        IOrganisationRepository organisationRepository,
        ICurrentUserService currentUserService)
    {
        _repository = repository;
        _userRepository = userRepository;
        _organisationRepository = organisationRepository;
        _currentUserService = currentUserService;
    }

    public async Task<IEnumerable<RfpResponseDto>> Handle(ListRfpsQuery request, CancellationToken cancellationToken)
    {
        var user = await _currentUserService.GetCurrentUserOrNullAsync(cancellationToken);
        var rfps = await _repository.ListAsync(cancellationToken);

        var visible = rfps.Where(r => VisibilityPolicy.CanViewRfp(r, user)).ToList();

        var authors = (await _userRepository.ListByIdsAsync(visible.Select(r => r.AuthorId).Distinct(), cancellationToken))
            .ToDictionary(u => u.Id);
        var organisations = (await _organisationRepository.ListAsync(cancellationToken))
            .ToDictionary(o => o.Id);

        return visible
            .Select(r => RfpResponseDto.From(r, authors.GetValueOrDefault(r.AuthorId), organisations.GetValueOrDefault(r.OrganisationId)))
            .ToList();
    }
}
