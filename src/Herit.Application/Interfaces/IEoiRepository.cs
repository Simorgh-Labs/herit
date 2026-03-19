using Herit.Domain.Entities;

namespace Herit.Application.Interfaces;

public interface IEoiRepository
{
    Task<Eoi?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Eoi>> ListByProposalAsync(Guid proposalId, CancellationToken cancellationToken = default);
    Task AddAsync(Eoi eoi, CancellationToken cancellationToken = default);
    Task UpdateAsync(Eoi eoi, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
