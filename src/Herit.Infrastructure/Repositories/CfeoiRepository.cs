using Herit.Application.Interfaces;
using Herit.Domain.Entities;
using Herit.Infrastructure.Persistence;

namespace Herit.Infrastructure.Repositories;

public class CfeoiRepository : ICfeoiRepository
{
    private readonly HeritDbContext _context;

    public CfeoiRepository(HeritDbContext context)
    {
        _context = context;
    }

    public Task<Cfeoi?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => throw new NotImplementedException();

    public Task<IEnumerable<Cfeoi>> ListByProposalAsync(Guid proposalId, CancellationToken cancellationToken = default)
        => throw new NotImplementedException();

    public Task AddAsync(Cfeoi cfeoi, CancellationToken cancellationToken = default)
        => throw new NotImplementedException();

    public Task UpdateAsync(Cfeoi cfeoi, CancellationToken cancellationToken = default)
        => throw new NotImplementedException();
}
