using Herit.Application.Features.Proposal.Queries.ListProposals;
using Herit.Application.Interfaces;
using NSubstitute;
using ProposalEntity = Herit.Domain.Entities.Proposal;

namespace Herit.Application.Tests.Features.Proposal.Queries;

public class ListProposalsQueryHandlerTests
{
    private readonly IProposalRepository _proposalRepository = Substitute.For<IProposalRepository>();
    private readonly ListProposalsQueryHandler _handler;

    public ListProposalsQueryHandlerTests()
    {
        _handler = new ListProposalsQueryHandler(_proposalRepository);
    }

    [Fact]
    public async Task Handle_NonEmptyList_ReturnsAllProposals()
    {
        var proposals = new[]
        {
            ProposalEntity.Create(Guid.NewGuid(), "Title 1", "Short 1", Guid.NewGuid(), Guid.NewGuid(), "Long 1"),
            ProposalEntity.Create(Guid.NewGuid(), "Title 2", "Short 2", Guid.NewGuid(), Guid.NewGuid(), "Long 2")
        };
        _proposalRepository.ListAsync(Arg.Any<CancellationToken>()).Returns(proposals);

        var result = await _handler.Handle(new ListProposalsQuery(), CancellationToken.None);

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task Handle_EmptyList_ReturnsEmptyEnumerable()
    {
        _proposalRepository.ListAsync(Arg.Any<CancellationToken>()).Returns(Enumerable.Empty<ProposalEntity>());

        var result = await _handler.Handle(new ListProposalsQuery(), CancellationToken.None);

        Assert.Empty(result);
    }
}
