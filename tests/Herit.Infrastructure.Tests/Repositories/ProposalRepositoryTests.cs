using Herit.Domain.Entities;
using Herit.Infrastructure.Persistence;
using Herit.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Herit.Infrastructure.Tests.Repositories;

public class ProposalRepositoryTests : IDisposable
{
    private readonly HeritDbContext _context;
    private readonly ProposalRepository _repository;

    public ProposalRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<HeritDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _context = new HeritDbContext(options);
        _repository = new ProposalRepository(_context);
    }

    public void Dispose() => _context.Dispose();

    private static Proposal CreateProposal(Guid? id = null, string title = "Test Proposal")
        => Proposal.Create(
            id ?? Guid.NewGuid(),
            title,
            "Short description",
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Long description");

    [Fact]
    public async Task GetByIdAsync_ReturnsProposal_WhenExists()
    {
        var id = Guid.NewGuid();
        var proposal = CreateProposal(id, "My Proposal");
        await _repository.AddAsync(proposal);

        var result = await _repository.GetByIdAsync(id);

        Assert.NotNull(result);
        Assert.Equal(id, result.Id);
        Assert.Equal("My Proposal", result.Title);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenNotExists()
    {
        var result = await _repository.GetByIdAsync(Guid.NewGuid());

        Assert.Null(result);
    }

    [Fact]
    public async Task ListAsync_ReturnsAllProposals()
    {
        await _repository.AddAsync(CreateProposal(title: "Proposal A"));
        await _repository.AddAsync(CreateProposal(title: "Proposal B"));

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
    public async Task AddAsync_PersistsProposal()
    {
        var id = Guid.NewGuid();
        var proposal = CreateProposal(id, "New Proposal");

        await _repository.AddAsync(proposal);

        var persisted = await _context.Proposals.FindAsync(id);
        Assert.NotNull(persisted);
        Assert.Equal("New Proposal", persisted.Title);
    }

    [Fact]
    public async Task UpdateAsync_PersistsChanges()
    {
        var id = Guid.NewGuid();
        var proposal = CreateProposal(id, "Original Title");
        await _repository.AddAsync(proposal);

        proposal.Update("Updated Title", "Updated short", "Updated long");
        await _repository.UpdateAsync(proposal);

        var persisted = await _context.Proposals.FindAsync(id);
        Assert.NotNull(persisted);
        Assert.Equal("Updated Title", persisted.Title);
        Assert.Equal("Updated short", persisted.ShortDescription);
        Assert.Equal("Updated long", persisted.LongDescription);
    }

    [Fact]
    public async Task DeleteAsync_RemovesProposal_WhenExists()
    {
        var id = Guid.NewGuid();
        await _repository.AddAsync(CreateProposal(id, "To Delete"));

        await _repository.DeleteAsync(id);

        var persisted = await _context.Proposals.FindAsync(id);
        Assert.Null(persisted);
    }

    [Fact]
    public async Task DeleteAsync_Throws_WhenNotExists()
    {
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _repository.DeleteAsync(Guid.NewGuid()));
    }
}
