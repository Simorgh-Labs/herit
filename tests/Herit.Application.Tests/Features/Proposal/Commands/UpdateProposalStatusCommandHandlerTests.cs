using Herit.Application.Features.Proposal.Commands.UpdateProposalStatus;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using MediatR;
using NSubstitute;
using ProposalEntity = Herit.Domain.Entities.Proposal;

namespace Herit.Application.Tests.Features.Proposal.Commands;

public class UpdateProposalStatusCommandHandlerTests
{
    private readonly IProposalRepository _proposalRepository = Substitute.For<IProposalRepository>();
    private readonly UpdateProposalStatusCommandHandler _handler;

    public UpdateProposalStatusCommandHandlerTests()
    {
        _handler = new UpdateProposalStatusCommandHandler(_proposalRepository);
    }

    private static ProposalEntity CreateIdeationProposal(Guid id)
        => ProposalEntity.Create(id, "Title", "Short", Guid.NewGuid(), Guid.NewGuid(), "Long");

    [Fact]
    public async Task Handle_ValidTransition_IdeationToResourcing_CallsUpdateAsyncOnce()
    {
        var id = Guid.NewGuid();
        var proposal = CreateIdeationProposal(id);
        _proposalRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(proposal);

        var result = await _handler.Handle(new UpdateProposalStatusCommand(id, ProposalStatus.Resourcing), CancellationToken.None);

        Assert.Equal(Unit.Value, result);
        Assert.Equal(ProposalStatus.Resourcing, proposal.Status);
        await _proposalRepository.Received(1).UpdateAsync(proposal, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_ProposalNotFound_ThrowsInvalidOperationException()
    {
        var id = Guid.NewGuid();
        _proposalRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns((ProposalEntity?)null);

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _handler.Handle(new UpdateProposalStatusCommand(id, ProposalStatus.Resourcing), CancellationToken.None));
        await _proposalRepository.DidNotReceive().UpdateAsync(Arg.Any<ProposalEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_IllegalTransition_ThrowsInvalidOperationException()
    {
        var id = Guid.NewGuid();
        var proposal = CreateIdeationProposal(id); // status is Ideation
        _proposalRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(proposal);

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _handler.Handle(new UpdateProposalStatusCommand(id, ProposalStatus.Approved), CancellationToken.None));
        await _proposalRepository.DidNotReceive().UpdateAsync(Arg.Any<ProposalEntity>(), Arg.Any<CancellationToken>());
    }
}
