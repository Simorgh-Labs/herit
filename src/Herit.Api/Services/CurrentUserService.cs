using Herit.Application.Features.User.Commands.RegisterExpat;
using Herit.Application.Interfaces;
using Herit.Domain.Entities;
using MediatR;

namespace Herit.Api.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IUserRepository _userRepository;
    private readonly IMediator _mediator;
    private User? _cachedUser;

    public CurrentUserService(
        IHttpContextAccessor httpContextAccessor,
        IUserRepository userRepository,
        IMediator mediator)
    {
        _httpContextAccessor = httpContextAccessor;
        _userRepository = userRepository;
        _mediator = mediator;
    }

    public async Task<User> GetCurrentUserAsync(CancellationToken ct = default)
    {
        if (_cachedUser is not null)
            return _cachedUser;

        var claimsPrincipal = _httpContextAccessor.HttpContext?.User
            ?? throw new UnauthorizedAccessException("No HTTP context available.");

        var externalId =
            claimsPrincipal.FindFirst("oid")?.Value
            ?? claimsPrincipal.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier")?.Value
            ?? claimsPrincipal.FindFirst("sub")?.Value
            ?? throw new UnauthorizedAccessException("B2C subject claim could not be determined.");

        var user = await _userRepository.GetByExternalIdAsync(externalId, ct);

        if (user is null)
        {
            var email =
                claimsPrincipal.FindFirst("emails")?.Value
                ?? claimsPrincipal.FindFirst("email")?.Value
                ?? claimsPrincipal.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value
                ?? string.Empty;

            var fullName =
                claimsPrincipal.FindFirst("name")?.Value
                ?? claimsPrincipal.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value
                ?? string.Empty;

            await _mediator.Send(new RegisterExpatCommand(externalId, email, fullName), ct);

            user = await _userRepository.GetByExternalIdAsync(externalId, ct)
                ?? throw new InvalidOperationException("User could not be created.");
        }

        _cachedUser = user;
        return _cachedUser;
    }
}
