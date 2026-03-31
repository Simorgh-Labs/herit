using Herit.Application.Interfaces;

namespace Herit.Api.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid GetCurrentUserId()
    {
        var nameIdentifier = _httpContextAccessor.HttpContext?.User.FindFirst(
            System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        if (nameIdentifier is null || !Guid.TryParse(nameIdentifier, out var userId))
            throw new UnauthorizedAccessException("Current user identity could not be determined.");

        return userId;
    }
}
