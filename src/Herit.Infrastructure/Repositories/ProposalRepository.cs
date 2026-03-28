using Herit.Application.Interfaces;
using Herit.Domain.Entities;
using Herit.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Herit.Infrastructure.Repositories;

public class ProposalRepository : IProposalRepository
{
    private readonly HeritDbContext _context;

    public ProposalRepository(HeritDbContext context)
    {
        _context = context;
    }

    public Task<Proposal?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => _context.Proposals.FindAsync([id], cancellationToken).AsTask();

    public async Task<IEnumerable<Proposal>> ListAsync(CancellationToken cancellationToken = default)
        => await _context.Proposals.ToListAsync(cancellationToken);

    public async Task AddAsync(Proposal proposal, CancellationToken cancellationToken = default)
    {
        await _context.Proposals.AddAsync(proposal, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Proposal proposal, CancellationToken cancellationToken = default)
    {
        var tracked = _context.ChangeTracker.Entries<Proposal>()
            .FirstOrDefault(e => e.Entity.Id == proposal.Id);
        if (tracked is not null)
            tracked.State = EntityState.Detached;

        _context.Proposals.Update(proposal);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var proposal = await _context.Proposals.FindAsync([id], cancellationToken)
            ?? throw new InvalidOperationException($"Proposal with id '{id}' was not found.");

        _context.Proposals.Remove(proposal);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
