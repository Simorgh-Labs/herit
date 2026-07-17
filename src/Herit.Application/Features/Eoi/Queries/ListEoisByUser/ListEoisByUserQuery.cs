using Herit.Application.Authorization;
using Herit.Application.Features.Eoi.Dtos;
using Herit.Application.Interfaces;
using MediatR;

namespace Herit.Application.Features.Eoi.Queries.ListEoisByUser;

public record ListEoisByUserQuery(Guid UserId) : IRequest<IEnumerable<EoiResponseDto>>;

public class ListEoisByUserQueryHandler : IRequestHandler<ListEoisByUserQuery, IEnumerable<EoiResponseDto>>
{
    private readonly IEoiRepository _eoiRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUserService;

    public ListEoisByUserQueryHandler(
        IEoiRepository eoiRepository,
        IUserRepository userRepository,
        ICurrentUserService currentUserService)
    {
        _eoiRepository = eoiRepository;
        _userRepository = userRepository;
        _currentUserService = currentUserService;
    }

    public async Task<IEnumerable<EoiResponseDto>> Handle(ListEoisByUserQuery request, CancellationToken cancellationToken)
    {
        var eois = (await _eoiRepository.ListByUserAsync(request.UserId, cancellationToken)).ToList();
        var submitter = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        var currentUser = await _currentUserService.GetCurrentUserOrNullAsync(cancellationToken);
        var includeEmail = VisibilityPolicy.IsStaff(currentUser);

        return eois.Select(e => EoiResponseDto.From(e, submitter, includeEmail)).ToList();
    }
}
