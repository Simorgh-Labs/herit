using Herit.Application.Interfaces;
using Herit.Domain.Entities;
using Herit.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Herit.Infrastructure.Repositories;

public class CfeoiRepository : ICfeoiRepository
{
    private readonly HeritDbContext _context;

    public CfeoiRepository(HeritDbContext context)
    {
        _context = context;
    }

    public Task<Cfeoi?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => _context.Cfeois.FindAsync([id], cancellationToken).AsTask();

    public async Task<IEnumerable<Cfeoi>> ListByProposalAsync(Guid proposalId, CancellationToken cancellationToken = default)
        => await _context.Cfeois
            .Where(c => c.ProposalId == proposalId)
            .ToListAsync(cancellationToken);

    public async Task AddAsync(Cfeoi cfeoi, CancellationToken cancellationToken = default)
    {
        await _context.Cfeois.AddAsync(cfeoi, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Cfeoi cfeoi, CancellationToken cancellationToken = default)
    {
        var tracked = _context.ChangeTracker.Entries<Cfeoi>()
            .FirstOrDefault(e => e.Entity.Id == cfeoi.Id);
        if (tracked is not null)
            tracked.State = EntityState.Detached;

        _context.Cfeois.Update(cfeoi);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
