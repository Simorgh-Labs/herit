using Herit.Application.Interfaces;
using Herit.Domain.Entities;
using Herit.Infrastructure.Persistence;

namespace Herit.Infrastructure.Repositories;

public class ProposalRepository : IProposalRepository
{
    private readonly HeritDbContext _context;

    public ProposalRepository(HeritDbContext context)
    {
        _context = context;
    }

    public Task<Proposal?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => throw new NotImplementedException();

    public Task<IEnumerable<Proposal>> ListAsync(CancellationToken cancellationToken = default)
        => throw new NotImplementedException();

    public Task AddAsync(Proposal proposal, CancellationToken cancellationToken = default)
        => throw new NotImplementedException();

    public Task UpdateAsync(Proposal proposal, CancellationToken cancellationToken = default)
        => throw new NotImplementedException();

    public Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        => throw new NotImplementedException();
}
