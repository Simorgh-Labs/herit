using Herit.Application.Exceptions;
using Herit.Domain.Entities;
using Herit.Domain.Enums;
using Herit.Infrastructure.Persistence;
using Herit.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Herit.Infrastructure.Tests.Repositories;

public class EoiRepositoryTests : IDisposable
{
    private readonly HeritDbContext _context;
    private readonly EoiRepository _repository;
    private readonly CfeoiRepository _cfeoiRepository;

    public EoiRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<HeritDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _context = new HeritDbContext(options);
        _repository = new EoiRepository(_context);
        _cfeoiRepository = new CfeoiRepository(_context);
    }

    public void Dispose() => _context.Dispose();

    private static Eoi CreateEoi(Guid? id = null, Guid? cfeoiId = null)
        => Eoi.Create(id ?? Guid.NewGuid(), Guid.NewGuid(), "Message", cfeoiId ?? Guid.NewGuid());

    private static Cfeoi CreateCfeoi(Guid? id = null, Guid? proposalId = null)
        => Cfeoi.Create(id ?? Guid.NewGuid(), "Title", "Description", CfeoiResourceType.Human, proposalId ?? Guid.NewGuid());

    [Fact]
    public async Task GetByIdAsync_ReturnsEoi_WhenExists()
    {
        var id = Guid.NewGuid();
        var eoi = CreateEoi(id);
        await _repository.AddAsync(eoi);

        var result = await _repository.GetByIdAsync(id);

        Assert.NotNull(result);
        Assert.Equal(id, result.Id);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenNotExists()
    {
        var result = await _repository.GetByIdAsync(Guid.NewGuid());

        Assert.Null(result);
    }

    [Fact]
    public async Task ListByCfeoiAsync_ReturnsMatchingEois()
    {
        var cfeoiId = Guid.NewGuid();
        await _repository.AddAsync(CreateEoi(cfeoiId: cfeoiId));
        await _repository.AddAsync(CreateEoi(cfeoiId: cfeoiId));
        await _repository.AddAsync(CreateEoi());

        var result = await _repository.ListByCfeoiAsync(cfeoiId);

        Assert.Equal(2, result.Count());
        Assert.All(result, e => Assert.Equal(cfeoiId, e.CfeoiId));
    }

    [Fact]
    public async Task ListByCfeoiAsync_WhenNoneMatch_ReturnsEmptyCollection()
    {
        await _repository.AddAsync(CreateEoi());

        var result = await _repository.ListByCfeoiAsync(Guid.NewGuid());

        Assert.Empty(result);
    }

    [Fact]
    public async Task ListByProposalAsync_ReturnsEoisWhoseCfeoiBelongsToProposal()
    {
        var proposalId = Guid.NewGuid();
        var cfeoiId = Guid.NewGuid();
        var cfeoi = CreateCfeoi(cfeoiId, proposalId);
        await _cfeoiRepository.AddAsync(cfeoi);
        await _repository.AddAsync(CreateEoi(cfeoiId: cfeoiId));
        await _repository.AddAsync(CreateEoi(cfeoiId: cfeoiId));
        await _repository.AddAsync(CreateEoi()); // belongs to different cfeoi/proposal

        var result = await _repository.ListByProposalAsync(proposalId);

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task ListByProposalAsync_WhenNoneMatch_ReturnsEmptyCollection()
    {
        await _repository.AddAsync(CreateEoi());

        var result = await _repository.ListByProposalAsync(Guid.NewGuid());

        Assert.Empty(result);
    }

    [Fact]
    public async Task AddAsync_PersistsEoi()
    {
        var id = Guid.NewGuid();
        var eoi = CreateEoi(id);

        await _repository.AddAsync(eoi);

        var persisted = await _context.Eois.FindAsync(id);
        Assert.NotNull(persisted);
        Assert.Equal(id, persisted.Id);
    }

    [Fact]
    public async Task UpdateAsync_PersistsChanges()
    {
        var id = Guid.NewGuid();
        var eoi = CreateEoi(id);
        await _repository.AddAsync(eoi);

        eoi.TransitionStatus(EoiStatus.Approved);
        await _repository.UpdateAsync(eoi);

        var persisted = await _context.Eois.FindAsync(id);
        Assert.NotNull(persisted);
        Assert.Equal(EoiStatus.Approved, persisted.Status);
    }

    [Fact]
    public async Task DeleteAsync_RemovesEoi_WhenExists()
    {
        var id = Guid.NewGuid();
        await _repository.AddAsync(CreateEoi(id));

        await _repository.DeleteAsync(id);

        var persisted = await _context.Eois.FindAsync(id);
        Assert.Null(persisted);
    }

    [Fact]
    public async Task DeleteAsync_Throws_WhenNotExists()
    {
        await Assert.ThrowsAsync<NotFoundException>(
            () => _repository.DeleteAsync(Guid.NewGuid()));
    }
}
