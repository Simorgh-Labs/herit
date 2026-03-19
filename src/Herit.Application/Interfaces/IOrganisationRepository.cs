using Herit.Domain.Entities;

namespace Herit.Application.Interfaces;

public interface IOrganisationRepository
{
    Task<Organisation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Organisation>> ListAsync(CancellationToken cancellationToken = default);
    Task AddAsync(Organisation organisation, CancellationToken cancellationToken = default);
    Task UpdateAsync(Organisation organisation, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
