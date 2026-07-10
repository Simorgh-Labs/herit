using Herit.Domain.Entities;

namespace Herit.Application.Interfaces;

public interface ICurrentUserService
{
    Task<User> GetCurrentUserAsync(CancellationToken ct = default);

    /// <summary>
    /// Resolves the caller's <see cref="User"/> record without side effects, returning
    /// <c>null</c> when the request is unauthenticated or no matching user exists.
    /// Use this on read paths (e.g. list queries) where anonymous access is permitted.
    /// </summary>
    Task<User?> GetCurrentUserOrNullAsync(CancellationToken ct = default);
}
