using Herit.Application.Interfaces;
using Herit.Domain.Entities;
using Herit.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Herit.Infrastructure.Repositories;

public class OrganisationRepository : IOrganisationRepository
{
    private readonly HeritDbContext _context;

    public OrganisationRepository(HeritDbContext context)
    {
        _context = context;
    }

    public Task<Organisation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => _context.Organisations.FindAsync([id], cancellationToken).AsTask();

    public async Task<IEnumerable<Organisation>> ListAsync(CancellationToken cancellationToken = default)
        => await _context.Organisations.ToListAsync(cancellationToken);

    public async Task AddAsync(Organisation organisation, CancellationToken cancellationToken = default)
    {
        await _context.Organisations.AddAsync(organisation, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Organisation organisation, CancellationToken cancellationToken = default)
    {
        var tracked = _context.ChangeTracker.Entries<Organisation>()
            .FirstOrDefault(e => e.Entity.Id == organisation.Id);
        if (tracked is not null)
            tracked.State = EntityState.Detached;

        _context.Organisations.Update(organisation);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var organisation = await _context.Organisations.FindAsync([id], cancellationToken);
        if (organisation is not null)
        {
            _context.Organisations.Remove(organisation);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
