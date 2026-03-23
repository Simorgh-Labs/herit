using Herit.Domain.Entities;
using Herit.Domain.Enums;
using Herit.Infrastructure.Persistence;
using Herit.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Herit.Infrastructure.Tests.Repositories;

public class UserRepositoryTests : IDisposable
{
    private readonly HeritDbContext _context;
    private readonly UserRepository _repository;

    public UserRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<HeritDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _context = new HeritDbContext(options);
        _repository = new UserRepository(_context);
    }

    public void Dispose() => _context.Dispose();

    [Fact]
    public async Task GetByIdAsync_ReturnsUser_WhenExists()
    {
        var id = Guid.NewGuid();
        var user = User.Create(id, "alice@example.com", "Alice Smith", UserRole.Staff);
        await _repository.AddAsync(user);

        var result = await _repository.GetByIdAsync(id);

        Assert.NotNull(result);
        Assert.Equal(id, result.Id);
        Assert.Equal("alice@example.com", result.Email);
        Assert.Equal("Alice Smith", result.FullName);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenNotExists()
    {
        var result = await _repository.GetByIdAsync(Guid.NewGuid());

        Assert.Null(result);
    }

    [Fact]
    public async Task ListAsync_ReturnsAllUsers()
    {
        await _repository.AddAsync(User.Create(Guid.NewGuid(), "a@example.com", "User A", UserRole.Staff));
        await _repository.AddAsync(User.Create(Guid.NewGuid(), "b@example.com", "User B", UserRole.OrganisationAdmin));

        var result = await _repository.ListAsync();

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task ListAsync_WhenEmpty_ReturnsEmptyCollection()
    {
        var result = await _repository.ListAsync();

        Assert.Empty(result);
    }

    [Fact]
    public async Task AddAsync_PersistsUser()
    {
        var id = Guid.NewGuid();
        var user = User.Create(id, "bob@example.com", "Bob Jones", UserRole.Expat);

        await _repository.AddAsync(user);

        var persisted = await _context.Users.FindAsync(id);
        Assert.NotNull(persisted);
        Assert.Equal("bob@example.com", persisted.Email);
        Assert.Equal("Bob Jones", persisted.FullName);
    }

    [Fact]
    public async Task UpdateAsync_PersistsChanges()
    {
        var id = Guid.NewGuid();
        var user = User.Create(id, "original@example.com", "Original Name", UserRole.Staff);
        await _repository.AddAsync(user);

        var updated = User.Create(id, "updated@example.com", "Updated Name", UserRole.OrganisationAdmin);
        await _repository.UpdateAsync(updated);

        var persisted = await _context.Users.FindAsync(id);
        Assert.NotNull(persisted);
        Assert.Equal("updated@example.com", persisted.Email);
        Assert.Equal("Updated Name", persisted.FullName);
        Assert.Equal(UserRole.OrganisationAdmin, persisted.Role);
    }

    [Fact]
    public async Task DeleteAsync_RemovesUser_WhenExists()
    {
        var id = Guid.NewGuid();
        await _repository.AddAsync(User.Create(id, "delete@example.com", "To Delete", UserRole.Staff));

        await _repository.DeleteAsync(id);

        var persisted = await _context.Users.FindAsync(id);
        Assert.Null(persisted);
    }

    [Fact]
    public async Task DeleteAsync_Throws_WhenNotExists()
    {
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _repository.DeleteAsync(Guid.NewGuid()));
    }
}
