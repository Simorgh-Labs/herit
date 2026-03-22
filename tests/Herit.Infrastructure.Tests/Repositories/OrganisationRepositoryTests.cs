using Herit.Domain.Entities;
using Herit.Infrastructure.Persistence;
using Herit.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Herit.Infrastructure.Tests.Repositories;

public class OrganisationRepositoryTests : IDisposable
{
    private readonly HeritDbContext _context;
    private readonly OrganisationRepository _repository;

    public OrganisationRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<HeritDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _context = new HeritDbContext(options);
        _repository = new OrganisationRepository(_context);
    }

    public void Dispose() => _context.Dispose();

    [Fact]
    public async Task GetByIdAsync_ReturnsOrganisation_WhenExists()
    {
        var id = Guid.NewGuid();
        var org = Organisation.Create(id, "Acme");
        await _repository.AddAsync(org);

        var result = await _repository.GetByIdAsync(id);

        Assert.NotNull(result);
        Assert.Equal(id, result.Id);
        Assert.Equal("Acme", result.Name);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenNotExists()
    {
        var result = await _repository.GetByIdAsync(Guid.NewGuid());

        Assert.Null(result);
    }

    [Fact]
    public async Task ListAsync_ReturnsAllOrganisations()
    {
        await _repository.AddAsync(Organisation.Create(Guid.NewGuid(), "Org A"));
        await _repository.AddAsync(Organisation.Create(Guid.NewGuid(), "Org B"));

        var result = await _repository.ListAsync();

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task AddAsync_PersistsOrganisation()
    {
        var id = Guid.NewGuid();
        var org = Organisation.Create(id, "New Org");

        await _repository.AddAsync(org);

        var persisted = await _context.Organisations.FindAsync(id);
        Assert.NotNull(persisted);
        Assert.Equal("New Org", persisted.Name);
    }

    [Fact]
    public async Task UpdateAsync_PersistsChanges()
    {
        var id = Guid.NewGuid();
        var org = Organisation.Create(id, "Original");
        await _repository.AddAsync(org);

        var updated = Organisation.Create(id, "Updated");
        await _repository.UpdateAsync(updated);

        var persisted = await _context.Organisations.FindAsync(id);
        Assert.NotNull(persisted);
        Assert.Equal("Updated", persisted.Name);
    }

    [Fact]
    public async Task DeleteAsync_RemovesOrganisation_WhenExists()
    {
        var id = Guid.NewGuid();
        await _repository.AddAsync(Organisation.Create(id, "To Delete"));

        await _repository.DeleteAsync(id);

        var persisted = await _context.Organisations.FindAsync(id);
        Assert.Null(persisted);
    }

    [Fact]
    public async Task DeleteAsync_DoesNotThrow_WhenNotExists()
    {
        var exception = await Record.ExceptionAsync(() => _repository.DeleteAsync(Guid.NewGuid()));

        Assert.Null(exception);
    }
}
