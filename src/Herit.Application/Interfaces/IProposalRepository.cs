using Herit.Domain.Entities;

namespace Herit.Application.Interfaces;

public interface IProposalRepository
{
    Task<Proposal?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Proposal>> ListAsync(CancellationToken cancellationToken = default);
    Task AddAsync(Proposal proposal, CancellationToken cancellationToken = default);
    Task UpdateAsync(Proposal proposal, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
