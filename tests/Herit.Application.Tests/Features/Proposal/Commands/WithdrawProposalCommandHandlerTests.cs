using Herit.Application.Exceptions;
using Herit.Application.Features.Proposal.Commands.WithdrawProposal;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using MediatR;
using NSubstitute;
using ProposalEntity = Herit.Domain.Entities.Proposal;

namespace Herit.Application.Tests.Features.Proposal.Commands;

public class WithdrawProposalCommandHandlerTests
{
    private readonly IProposalRepository _proposalRepository = Substitute.For<IProposalRepository>();
    private readonly WithdrawProposalCommandHandler _handler;

    public WithdrawProposalCommandHandlerTests()
    {
        _handler = new WithdrawProposalCommandHandler(_proposalRepository);
    }

    private static ProposalEntity CreateSubmittedProposal(Guid id)
    {
        var proposal = ProposalEntity.Create(id, "Title", "Short", Guid.NewGuid(), Guid.NewGuid(), "Long");
        proposal.TransitionStatus(ProposalStatus.Resourcing);
        proposal.TransitionStatus(ProposalStatus.Submitted);
        return proposal;
    }

    [Fact]
    public async Task Handle_SubmittedProposal_TransitionsToWithdrawn()
    {
        var id = Guid.NewGuid();
        var proposal = CreateSubmittedProposal(id);
        _proposalRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(proposal);

        var result = await _handler.Handle(new WithdrawProposalCommand(id), CancellationToken.None);

        Assert.Equal(Unit.Value, result);
        Assert.Equal(ProposalStatus.Withdrawn, proposal.Status);
        await _proposalRepository.Received(1).UpdateAsync(proposal, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_ProposalNotFound_ThrowsNotFoundException()
    {
        var id = Guid.NewGuid();
        _proposalRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns((ProposalEntity?)null);

        await Assert.ThrowsAsync<NotFoundException>(
            () => _handler.Handle(new WithdrawProposalCommand(id), CancellationToken.None));
        await _proposalRepository.DidNotReceive().UpdateAsync(Arg.Any<ProposalEntity>(), Arg.Any<CancellationToken>());
    }
}
