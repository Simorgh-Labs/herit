using Herit.Application.Authorization;
using Herit.Application.Exceptions;
using Herit.Application.Features.Eoi.Dtos;
using Herit.Application.Interfaces;
using MediatR;

namespace Herit.Application.Features.Eoi.Queries.GetEoiById;

public record GetEoiByIdQuery(Guid Id) : IRequest<EoiResponseDto>;

public class GetEoiByIdQueryHandler : IRequestHandler<GetEoiByIdQuery, EoiResponseDto>
{
    private readonly IEoiRepository _eoiRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUserService;

    public GetEoiByIdQueryHandler(
        IEoiRepository eoiRepository,
        IUserRepository userRepository,
        ICurrentUserService currentUserService)
    {
        _eoiRepository = eoiRepository;
        _userRepository = userRepository;
        _currentUserService = currentUserService;
    }

    public async Task<EoiResponseDto> Handle(GetEoiByIdQuery request, CancellationToken cancellationToken)
    {
        var eoi = await _eoiRepository.GetByIdAsync(request.Id, cancellationToken);
        if (eoi is null)
            throw new NotFoundException($"Eoi '{request.Id}' was not found.");

        var submitter = await _userRepository.GetByIdAsync(eoi.SubmittedById, cancellationToken);
        var currentUser = await _currentUserService.GetCurrentUserOrNullAsync(cancellationToken);
        var includeEmail = VisibilityPolicy.IsStaff(currentUser);

        return EoiResponseDto.From(eoi, submitter, includeEmail);
    }
}
