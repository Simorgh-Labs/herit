using Herit.Application.Interfaces;
using Herit.Domain.Entities;
using Herit.Infrastructure.Persistence;

namespace Herit.Infrastructure.Repositories;

public class EoiRepository : IEoiRepository
{
    private readonly HeritDbContext _context;

    public EoiRepository(HeritDbContext context)
    {
        _context = context;
    }

    public Task<Eoi?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => throw new NotImplementedException();

    public Task<IEnumerable<Eoi>> ListByCfeoiAsync(Guid cfeoiId, CancellationToken cancellationToken = default)
        => throw new NotImplementedException();

    public Task AddAsync(Eoi eoi, CancellationToken cancellationToken = default)
        => throw new NotImplementedException();

    public Task UpdateAsync(Eoi eoi, CancellationToken cancellationToken = default)
        => throw new NotImplementedException();

    public Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        => throw new NotImplementedException();
}
