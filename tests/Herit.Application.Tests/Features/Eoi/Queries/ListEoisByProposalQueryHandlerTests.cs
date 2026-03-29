using Herit.Application.Features.Eoi.Queries.ListEoisByProposal;
using Herit.Application.Interfaces;
using NSubstitute;
using EoiEntity = Herit.Domain.Entities.Eoi;

namespace Herit.Application.Tests.Features.Eoi.Queries;

public class ListEoisByProposalQueryHandlerTests
{
    private readonly IEoiRepository _eoiRepository = Substitute.For<IEoiRepository>();
    private readonly ListEoisByProposalQueryHandler _handler;

    public ListEoisByProposalQueryHandlerTests()
    {
        _handler = new ListEoisByProposalQueryHandler(_eoiRepository);
    }

    [Fact]
    public async Task Handle_NonEmptyList_ReturnsAllEois()
    {
        var proposalId = Guid.NewGuid();
        var eois = new[]
        {
            EoiEntity.Create(Guid.NewGuid(), Guid.NewGuid(), "Message 1", Guid.NewGuid()),
            EoiEntity.Create(Guid.NewGuid(), Guid.NewGuid(), "Message 2", Guid.NewGuid())
        };
        _eoiRepository.ListByProposalAsync(proposalId, Arg.Any<CancellationToken>()).Returns(eois);

        var result = await _handler.Handle(new ListEoisByProposalQuery(proposalId), CancellationToken.None);

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task Handle_EmptyList_ReturnsEmptyEnumerable()
    {
        var proposalId = Guid.NewGuid();
        _eoiRepository.ListByProposalAsync(proposalId, Arg.Any<CancellationToken>()).Returns(Enumerable.Empty<EoiEntity>());

        var result = await _handler.Handle(new ListEoisByProposalQuery(proposalId), CancellationToken.None);

        Assert.Empty(result);
    }
}
