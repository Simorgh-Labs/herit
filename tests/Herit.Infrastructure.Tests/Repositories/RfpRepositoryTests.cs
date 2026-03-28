using Herit.Domain.Entities;
using Herit.Infrastructure.Persistence;
using Herit.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Herit.Infrastructure.Tests.Repositories;

public class RfpRepositoryTests : IDisposable
{
    private readonly HeritDbContext _context;
    private readonly RfpRepository _repository;

    public RfpRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<HeritDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _context = new HeritDbContext(options);
        _repository = new RfpRepository(_context);
    }

    public void Dispose() => _context.Dispose();

    private static Rfp CreateRfp(Guid? id = null, string title = "Test RFP")
        => Rfp.Create(
            id ?? Guid.NewGuid(),
            title,
            "Short description",
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Long description");

    [Fact]
    public async Task GetByIdAsync_ReturnsRfp_WhenExists()
    {
        var id = Guid.NewGuid();
        var rfp = CreateRfp(id, "My RFP");
        await _repository.AddAsync(rfp);

        var result = await _repository.GetByIdAsync(id);

        Assert.NotNull(result);
        Assert.Equal(id, result.Id);
        Assert.Equal("My RFP", result.Title);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenNotExists()
    {
        var result = await _repository.GetByIdAsync(Guid.NewGuid());

        Assert.Null(result);
    }

    [Fact]
    public async Task ListAsync_ReturnsAllRfps()
    {
        await _repository.AddAsync(CreateRfp(title: "RFP A"));
        await _repository.AddAsync(CreateRfp(title: "RFP B"));

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
    public async Task AddAsync_PersistsRfp()
    {
        var id = Guid.NewGuid();
        var rfp = CreateRfp(id, "New RFP");

        await _repository.AddAsync(rfp);

        var persisted = await _context.Rfps.FindAsync(id);
        Assert.NotNull(persisted);
        Assert.Equal("New RFP", persisted.Title);
    }

    [Fact]
    public async Task UpdateAsync_PersistsChanges()
    {
        var id = Guid.NewGuid();
        var rfp = CreateRfp(id, "Original Title");
        await _repository.AddAsync(rfp);

        rfp.Update("Updated Title", "Updated short", "Updated long");
        await _repository.UpdateAsync(rfp);

        var persisted = await _context.Rfps.FindAsync(id);
        Assert.NotNull(persisted);
        Assert.Equal("Updated Title", persisted.Title);
        Assert.Equal("Updated short", persisted.ShortDescription);
        Assert.Equal("Updated long", persisted.LongDescription);
    }

    [Fact]
    public async Task DeleteAsync_RemovesRfp_WhenExists()
    {
        var id = Guid.NewGuid();
        await _repository.AddAsync(CreateRfp(id, "To Delete"));

        await _repository.DeleteAsync(id);

        var persisted = await _context.Rfps.FindAsync(id);
        Assert.Null(persisted);
    }

    [Fact]
    public async Task DeleteAsync_Throws_WhenNotExists()
    {
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _repository.DeleteAsync(Guid.NewGuid()));
    }
}
