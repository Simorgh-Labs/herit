using Herit.Domain.Entities;
using Herit.Domain.Enums;
using Herit.Infrastructure.Persistence;
using Herit.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Herit.Infrastructure.Tests.Repositories;

public class CfeoiRepositoryTests : IDisposable
{
    private readonly HeritDbContext _context;
    private readonly CfeoiRepository _repository;

    public CfeoiRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<HeritDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _context = new HeritDbContext(options);
        _repository = new CfeoiRepository(_context);
    }

    public void Dispose() => _context.Dispose();

    private static Cfeoi CreateCfeoi(Guid? id = null, Guid? proposalId = null, string title = "Test CFEOI")
        => Cfeoi.Create(
            id ?? Guid.NewGuid(),
            title,
            "Description",
            CfeoiResourceType.Human,
            proposalId ?? Guid.NewGuid());

    [Fact]
    public async Task GetByIdAsync_ReturnsCfeoi_WhenExists()
    {
        var id = Guid.NewGuid();
        var cfeoi = CreateCfeoi(id, title: "My CFEOI");
        await _repository.AddAsync(cfeoi);

        var result = await _repository.GetByIdAsync(id);

        Assert.NotNull(result);
        Assert.Equal(id, result.Id);
        Assert.Equal("My CFEOI", result.Title);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenNotExists()
    {
        var result = await _repository.GetByIdAsync(Guid.NewGuid());

        Assert.Null(result);
    }

    [Fact]
    public async Task ListByProposalAsync_ReturnsMatchingCfeois()
    {
        var proposalId = Guid.NewGuid();
        await _repository.AddAsync(CreateCfeoi(proposalId: proposalId, title: "CFEOI A"));
        await _repository.AddAsync(CreateCfeoi(proposalId: proposalId, title: "CFEOI B"));
        await _repository.AddAsync(CreateCfeoi(title: "Other CFEOI"));

        var result = await _repository.ListByProposalAsync(proposalId);

        Assert.Equal(2, result.Count());
        Assert.All(result, c => Assert.Equal(proposalId, c.ProposalId));
    }

    [Fact]
    public async Task ListByProposalAsync_WhenNoneMatch_ReturnsEmptyCollection()
    {
        await _repository.AddAsync(CreateCfeoi(title: "Other CFEOI"));

        var result = await _repository.ListByProposalAsync(Guid.NewGuid());

        Assert.Empty(result);
    }

    [Fact]
    public async Task AddAsync_PersistsCfeoi()
    {
        var id = Guid.NewGuid();
        var cfeoi = CreateCfeoi(id, title: "New CFEOI");

        await _repository.AddAsync(cfeoi);

        var persisted = await _context.Cfeois.FindAsync(id);
        Assert.NotNull(persisted);
        Assert.Equal("New CFEOI", persisted.Title);
    }

    [Fact]
    public async Task UpdateAsync_PersistsChanges()
    {
        var id = Guid.NewGuid();
        var cfeoi = CreateCfeoi(id, title: "Original Title");
        await _repository.AddAsync(cfeoi);

        cfeoi.TransitionStatus(CfeoiStatus.Closed);
        await _repository.UpdateAsync(cfeoi);

        var persisted = await _context.Cfeois.FindAsync(id);
        Assert.NotNull(persisted);
        Assert.Equal(CfeoiStatus.Closed, persisted.Status);
    }
}
