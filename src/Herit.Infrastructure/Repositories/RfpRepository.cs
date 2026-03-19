using Herit.Application.Interfaces;
using Herit.Domain.Entities;
using Herit.Infrastructure.Persistence;

namespace Herit.Infrastructure.Repositories;

public class RfpRepository : IRfpRepository
{
    private readonly HeritDbContext _context;

    public RfpRepository(HeritDbContext context)
    {
        _context = context;
    }

    public Task<Rfp?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => throw new NotImplementedException();

    public Task<IEnumerable<Rfp>> ListAsync(CancellationToken cancellationToken = default)
        => throw new NotImplementedException();

    public Task AddAsync(Rfp rfp, CancellationToken cancellationToken = default)
        => throw new NotImplementedException();

    public Task UpdateAsync(Rfp rfp, CancellationToken cancellationToken = default)
        => throw new NotImplementedException();

    public Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        => throw new NotImplementedException();
}
