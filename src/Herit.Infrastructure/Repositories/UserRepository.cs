using Herit.Application.Exceptions;
using Herit.Application.Interfaces;
using Herit.Domain.Entities;
using Herit.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Herit.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly HeritDbContext _context;

    public UserRepository(HeritDbContext context)
    {
        _context = context;
    }

    public Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => _context.Users.FindAsync([id], cancellationToken).AsTask();

    public Task<User?> GetByExternalIdAsync(string externalId, CancellationToken cancellationToken = default)
        => _context.Users.FirstOrDefaultAsync(u => u.ExternalId == externalId, cancellationToken);

    public async Task<IEnumerable<User>> ListAsync(CancellationToken cancellationToken = default)
        => await _context.Users.ToListAsync(cancellationToken);

    public async Task AddAsync(User user, CancellationToken cancellationToken = default)
    {
        await _context.Users.AddAsync(user, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(User user, CancellationToken cancellationToken = default)
    {
        var tracked = _context.ChangeTracker.Entries<User>()
            .FirstOrDefault(e => e.Entity.Id == user.Id);
        if (tracked is not null)
            tracked.State = EntityState.Detached;

        _context.Users.Update(user);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FindAsync([id], cancellationToken)
            ?? throw new NotFoundException($"User with id '{id}' was not found.");

        _context.Users.Remove(user);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
