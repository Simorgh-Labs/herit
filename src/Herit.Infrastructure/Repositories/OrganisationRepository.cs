using Herit.Application.Interfaces;
using Herit.Domain.Entities;
using Herit.Infrastructure.Persistence;

namespace Herit.Infrastructure.Repositories;

public class OrganisationRepository : IOrganisationRepository
{
    private readonly HeritDbContext _context;

    public OrganisationRepository(HeritDbContext context)
    {
        _context = context;
    }

    public Task<Organisation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => throw new NotImplementedException();

    public Task<IEnumerable<Organisation>> ListAsync(CancellationToken cancellationToken = default)
        => throw new NotImplementedException();

    public Task AddAsync(Organisation organisation, CancellationToken cancellationToken = default)
        => throw new NotImplementedException();

    public Task UpdateAsync(Organisation organisation, CancellationToken cancellationToken = default)
        => throw new NotImplementedException();

    public Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        => throw new NotImplementedException();
}
