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

    [Fact]
    public async Task ListAsync_WhenEmpty_ReturnsEmptyCollection()
    {
        var result = await _repository.ListAsync();

        Assert.Empty(result);
    }

    [Fact]
    public async Task AddAsync_WithParentId_PersistsParentId()
    {
        var parentId = Guid.NewGuid();
        var parent = Organisation.Create(parentId, "Parent Org");
        await _repository.AddAsync(parent);

        var childId = Guid.NewGuid();
        var child = Organisation.Create(childId, "Child Org", parentId);
        await _repository.AddAsync(child);

        var persisted = await _repository.GetByIdAsync(childId);
        Assert.NotNull(persisted);
        Assert.Equal(parentId, persisted.ParentId);
    }

    [Fact]
    public async Task UpdateAsync_PreservesParentId()
    {
        var parentId = Guid.NewGuid();
        await _repository.AddAsync(Organisation.Create(parentId, "Parent"));

        var childId = Guid.NewGuid();
        var child = Organisation.Create(childId, "Child", parentId);
        await _repository.AddAsync(child);

        child.Update("Renamed Child");
        await _repository.UpdateAsync(child);

        var persisted = await _repository.GetByIdAsync(childId);
        Assert.NotNull(persisted);
        Assert.Equal("Renamed Child", persisted.Name);
        Assert.Equal(parentId, persisted.ParentId);
    }
}
