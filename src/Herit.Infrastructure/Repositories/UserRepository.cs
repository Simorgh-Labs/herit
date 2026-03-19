using Herit.Application.Interfaces;
using Herit.Domain.Entities;
using Herit.Infrastructure.Persistence;

namespace Herit.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly HeritDbContext _context;

    public UserRepository(HeritDbContext context)
    {
        _context = context;
    }

    public Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => throw new NotImplementedException();

    public Task<IEnumerable<User>> ListAsync(CancellationToken cancellationToken = default)
        => throw new NotImplementedException();

    public Task AddAsync(User user, CancellationToken cancellationToken = default)
        => throw new NotImplementedException();

    public Task UpdateAsync(User user, CancellationToken cancellationToken = default)
        => throw new NotImplementedException();

    public Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        => throw new NotImplementedException();
}
