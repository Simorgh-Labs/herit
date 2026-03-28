using Herit.Application.Interfaces;
using Herit.Domain.Entities;
using Herit.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Herit.Infrastructure.Repositories;

public class RfpRepository : IRfpRepository
{
    private readonly HeritDbContext _context;

    public RfpRepository(HeritDbContext context)
    {
        _context = context;
    }

    public Task<Rfp?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => _context.Rfps.FindAsync([id], cancellationToken).AsTask();

    public async Task<IEnumerable<Rfp>> ListAsync(CancellationToken cancellationToken = default)
        => await _context.Rfps.ToListAsync(cancellationToken);

    public async Task AddAsync(Rfp rfp, CancellationToken cancellationToken = default)
    {
        await _context.Rfps.AddAsync(rfp, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Rfp rfp, CancellationToken cancellationToken = default)
    {
        var tracked = _context.ChangeTracker.Entries<Rfp>()
            .FirstOrDefault(e => e.Entity.Id == rfp.Id);
        if (tracked is not null)
            tracked.State = EntityState.Detached;

        _context.Rfps.Update(rfp);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var rfp = await _context.Rfps.FindAsync([id], cancellationToken)
            ?? throw new InvalidOperationException($"Rfp with id '{id}' was not found.");

        _context.Rfps.Remove(rfp);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
