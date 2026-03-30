using Herit.Application.Exceptions;
using Herit.Application.Interfaces;
using Herit.Domain.Entities;
using Herit.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Herit.Infrastructure.Repositories;

public class EoiRepository : IEoiRepository
{
    private readonly HeritDbContext _context;

    public EoiRepository(HeritDbContext context)
    {
        _context = context;
    }

    public Task<Eoi?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => _context.Eois.FindAsync([id], cancellationToken).AsTask();

    public async Task<IEnumerable<Eoi>> ListByCfeoiAsync(Guid cfeoiId, CancellationToken cancellationToken = default)
        => await _context.Eois
            .Where(e => e.CfeoiId == cfeoiId)
            .ToListAsync(cancellationToken);

    public async Task<IEnumerable<Eoi>> ListByProposalAsync(Guid proposalId, CancellationToken cancellationToken = default)
        => await _context.Eois
            .Join(_context.Cfeois, e => e.CfeoiId, c => c.Id, (e, c) => new { Eoi = e, c.ProposalId })
            .Where(x => x.ProposalId == proposalId)
            .Select(x => x.Eoi)
            .ToListAsync(cancellationToken);

    public async Task AddAsync(Eoi eoi, CancellationToken cancellationToken = default)
    {
        await _context.Eois.AddAsync(eoi, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Eoi eoi, CancellationToken cancellationToken = default)
    {
        var tracked = _context.ChangeTracker.Entries<Eoi>()
            .FirstOrDefault(e => e.Entity.Id == eoi.Id);
        if (tracked is not null)
            tracked.State = EntityState.Detached;

        _context.Eois.Update(eoi);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var eoi = await _context.Eois.FindAsync([id], cancellationToken)
            ?? throw new NotFoundException($"Eoi with id '{id}' was not found.");

        _context.Eois.Remove(eoi);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
