using Herit.Domain.Entities;

namespace Herit.Application.Interfaces;

public interface ICurrentUserService
{
    Task<User> GetCurrentUserAsync(CancellationToken ct = default);
}
