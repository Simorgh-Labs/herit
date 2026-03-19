using Herit.Domain.Entities;

namespace Herit.Application.Interfaces;

public interface ICfeoiRepository
{
    Task<Cfeoi?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Cfeoi>> ListByProposalAsync(Guid proposalId, CancellationToken cancellationToken = default);
    Task AddAsync(Cfeoi cfeoi, CancellationToken cancellationToken = default);
    Task UpdateAsync(Cfeoi cfeoi, CancellationToken cancellationToken = default);
}
