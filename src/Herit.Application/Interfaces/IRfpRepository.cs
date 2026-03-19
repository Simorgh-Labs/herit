using Herit.Domain.Entities;

namespace Herit.Application.Interfaces;

public interface IRfpRepository
{
    Task<Rfp?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Rfp>> ListAsync(CancellationToken cancellationToken = default);
    Task AddAsync(Rfp rfp, CancellationToken cancellationToken = default);
    Task UpdateAsync(Rfp rfp, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
