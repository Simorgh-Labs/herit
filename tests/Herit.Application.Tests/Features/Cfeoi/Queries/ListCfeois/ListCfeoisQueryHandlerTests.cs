using Herit.Application.Features.Cfeoi.Queries.ListCfeois;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using NSubstitute;
using CfeoiEntity = Herit.Domain.Entities.Cfeoi;

namespace Herit.Application.Tests.Features.Cfeoi.Queries.ListCfeois;

public class ListCfeoisQueryHandlerTests
{
    private readonly ICfeoiRepository _cfeoiRepository = Substitute.For<ICfeoiRepository>();
    private readonly ListCfeoisQueryHandler _handler;

    public ListCfeoisQueryHandlerTests()
    {
        _handler = new ListCfeoisQueryHandler(_cfeoiRepository);
    }

    [Fact]
    public async Task Handle_NoFilters_ReturnsAllCfeois()
    {
        var cfeois = new[]
        {
            CfeoiEntity.Create(Guid.NewGuid(), "Title 1", "Description 1", CfeoiResourceType.Human, Guid.NewGuid(), "R", "S", 1),
            CfeoiEntity.Create(Guid.NewGuid(), "Title 2", "Description 2", CfeoiResourceType.NonHuman, Guid.NewGuid(), "R", "S", 1),
            CfeoiEntity.Create(Guid.NewGuid(), "Title 3", "Description 3", CfeoiResourceType.Human, Guid.NewGuid(), "R", "S", 1)
        };
        _cfeoiRepository.ListAsync(null, null, Arg.Any<CancellationToken>()).Returns(cfeois);

        var result = await _handler.Handle(new ListCfeoisQuery(), CancellationToken.None);

        Assert.Equal(3, result.Count());
    }

    [Fact]
    public async Task Handle_FilterByStatus_PassesStatusToRepository()
    {
        var proposalId = Guid.NewGuid();
        var cfeois = new[]
        {
            CfeoiEntity.Create(Guid.NewGuid(), "Open CFEOI", "Description", CfeoiResourceType.Human, proposalId, "R", "S", 1)
        };
        _cfeoiRepository.ListAsync(CfeoiStatus.Open, null, Arg.Any<CancellationToken>()).Returns(cfeois);

        var result = await _handler.Handle(new ListCfeoisQuery(Status: CfeoiStatus.Open), CancellationToken.None);

        Assert.Single(result);
        await _cfeoiRepository.Received(1).ListAsync(CfeoiStatus.Open, null, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_FilterByProposalId_PassesProposalIdToRepository()
    {
        var proposalId = Guid.NewGuid();
        var cfeois = new[]
        {
            CfeoiEntity.Create(Guid.NewGuid(), "Title A", "Description", CfeoiResourceType.Human, proposalId, "R", "S", 1),
            CfeoiEntity.Create(Guid.NewGuid(), "Title B", "Description", CfeoiResourceType.NonHuman, proposalId, "R", "S", 1)
        };
        _cfeoiRepository.ListAsync(null, proposalId, Arg.Any<CancellationToken>()).Returns(cfeois);

        var result = await _handler.Handle(new ListCfeoisQuery(ProposalId: proposalId), CancellationToken.None);

        Assert.Equal(2, result.Count());
        await _cfeoiRepository.Received(1).ListAsync(null, proposalId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_EmptyList_ReturnsEmptyEnumerable()
    {
        _cfeoiRepository.ListAsync(null, null, Arg.Any<CancellationToken>()).Returns(Enumerable.Empty<CfeoiEntity>());

        var result = await _handler.Handle(new ListCfeoisQuery(), CancellationToken.None);

        Assert.Empty(result);
    }
}
