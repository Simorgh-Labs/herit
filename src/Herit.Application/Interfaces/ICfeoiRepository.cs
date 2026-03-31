using Herit.Domain.Entities;
using Herit.Domain.Enums;

namespace Herit.Application.Interfaces;

public interface ICfeoiRepository
{
    Task<Cfeoi?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Cfeoi>> ListAsync(CfeoiStatus? status = null, Guid? proposalId = null, CancellationToken cancellationToken = default);
    Task<IEnumerable<Cfeoi>> ListByProposalAsync(Guid proposalId, CancellationToken cancellationToken = default);
    Task AddAsync(Cfeoi cfeoi, CancellationToken cancellationToken = default);
    Task UpdateAsync(Cfeoi cfeoi, CancellationToken cancellationToken = default);
}
