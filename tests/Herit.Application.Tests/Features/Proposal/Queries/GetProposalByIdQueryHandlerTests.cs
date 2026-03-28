using Herit.Application.Features.Proposal.Queries.GetProposalById;
using Herit.Application.Interfaces;
using NSubstitute;
using ProposalEntity = Herit.Domain.Entities.Proposal;

namespace Herit.Application.Tests.Features.Proposal.Queries;

public class GetProposalByIdQueryHandlerTests
{
    private readonly IProposalRepository _proposalRepository = Substitute.For<IProposalRepository>();
    private readonly GetProposalByIdQueryHandler _handler;

    public GetProposalByIdQueryHandlerTests()
    {
        _handler = new GetProposalByIdQueryHandler(_proposalRepository);
    }

    [Fact]
    public async Task Handle_ProposalFound_ReturnsProposal()
    {
        var proposalId = Guid.NewGuid();
        var proposal = ProposalEntity.Create(proposalId, "Title", "Short", Guid.NewGuid(), Guid.NewGuid(), "Long");
        _proposalRepository.GetByIdAsync(proposalId, Arg.Any<CancellationToken>()).Returns(proposal);

        var result = await _handler.Handle(new GetProposalByIdQuery(proposalId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(proposalId, result.Id);
    }

    [Fact]
    public async Task Handle_ProposalNotFound_ReturnsNull()
    {
        var proposalId = Guid.NewGuid();
        _proposalRepository.GetByIdAsync(proposalId, Arg.Any<CancellationToken>()).Returns((ProposalEntity?)null);

        var result = await _handler.Handle(new GetProposalByIdQuery(proposalId), CancellationToken.None);

        Assert.Null(result);
    }
}
