using Herit.Application.Features.Cfeoi.Queries.ListCfeoisByProposal;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using NSubstitute;
using CfeoiEntity = Herit.Domain.Entities.Cfeoi;

namespace Herit.Application.Tests.Features.Cfeoi.Queries;

public class ListCfeoisByProposalQueryHandlerTests
{
    private readonly ICfeoiRepository _cfeoiRepository = Substitute.For<ICfeoiRepository>();
    private readonly ListCfeoisByProposalQueryHandler _handler;

    public ListCfeoisByProposalQueryHandlerTests()
    {
        _handler = new ListCfeoisByProposalQueryHandler(_cfeoiRepository);
    }

    [Fact]
    public async Task Handle_NonEmptyList_ReturnsAllCfeois()
    {
        var proposalId = Guid.NewGuid();
        var cfeois = new[]
        {
            CfeoiEntity.Create(Guid.NewGuid(), "Title 1", "Description 1", CfeoiResourceType.Human, proposalId),
            CfeoiEntity.Create(Guid.NewGuid(), "Title 2", "Description 2", CfeoiResourceType.NonHuman, proposalId)
        };
        _cfeoiRepository.ListByProposalAsync(proposalId, Arg.Any<CancellationToken>()).Returns(cfeois);

        var result = await _handler.Handle(new ListCfeoisByProposalQuery(proposalId), CancellationToken.None);

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task Handle_EmptyList_ReturnsEmptyEnumerable()
    {
        var proposalId = Guid.NewGuid();
        _cfeoiRepository.ListByProposalAsync(proposalId, Arg.Any<CancellationToken>()).Returns(Enumerable.Empty<CfeoiEntity>());

        var result = await _handler.Handle(new ListCfeoisByProposalQuery(proposalId), CancellationToken.None);

        Assert.Empty(result);
    }
}
