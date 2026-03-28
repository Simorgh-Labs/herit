using Herit.Application.Features.Proposal.Commands.SetProposalVisibility;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using MediatR;
using NSubstitute;
using ProposalEntity = Herit.Domain.Entities.Proposal;

namespace Herit.Application.Tests.Features.Proposal.Commands;

public class SetProposalVisibilityCommandHandlerTests
{
    private readonly IProposalRepository _proposalRepository = Substitute.For<IProposalRepository>();
    private readonly SetProposalVisibilityCommandHandler _handler;

    public SetProposalVisibilityCommandHandlerTests()
    {
        _handler = new SetProposalVisibilityCommandHandler(_proposalRepository);
    }

    [Fact]
    public async Task Handle_HappyPath_SetsVisibilityAndCallsUpdateAsync()
    {
        var proposalId = Guid.NewGuid();
        var proposal = ProposalEntity.Create(proposalId, "Title", "Short", Guid.NewGuid(), Guid.NewGuid(), "Long");
        _proposalRepository.GetByIdAsync(proposalId, Arg.Any<CancellationToken>()).Returns(proposal);

        var result = await _handler.Handle(new SetProposalVisibilityCommand(proposalId, ProposalVisibility.Public), CancellationToken.None);

        Assert.Equal(Unit.Value, result);
        Assert.Equal(ProposalVisibility.Public, proposal.Visibility);
        await _proposalRepository.Received(1).UpdateAsync(
            Arg.Is<ProposalEntity>(p => p.Visibility == ProposalVisibility.Public),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_ProposalNotFound_ThrowsInvalidOperationException()
    {
        var proposalId = Guid.NewGuid();
        _proposalRepository.GetByIdAsync(proposalId, Arg.Any<CancellationToken>()).Returns((ProposalEntity?)null);

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _handler.Handle(new SetProposalVisibilityCommand(proposalId, ProposalVisibility.Public), CancellationToken.None));
        await _proposalRepository.DidNotReceive().UpdateAsync(Arg.Any<ProposalEntity>(), Arg.Any<CancellationToken>());
    }
}
