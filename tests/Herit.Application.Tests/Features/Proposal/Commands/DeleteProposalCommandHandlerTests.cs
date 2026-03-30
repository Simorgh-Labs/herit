using Herit.Application.Exceptions;
using Herit.Application.Features.Proposal.Commands.DeleteProposal;
using Herit.Application.Interfaces;
using MediatR;
using NSubstitute;
using ProposalEntity = Herit.Domain.Entities.Proposal;

namespace Herit.Application.Tests.Features.Proposal.Commands;

public class DeleteProposalCommandHandlerTests
{
    private readonly IProposalRepository _proposalRepository = Substitute.For<IProposalRepository>();
    private readonly DeleteProposalCommandHandler _handler;

    public DeleteProposalCommandHandlerTests()
    {
        _handler = new DeleteProposalCommandHandler(_proposalRepository);
    }

    [Fact]
    public async Task Handle_HappyPath_CallsDeleteAsync()
    {
        var proposalId = Guid.NewGuid();
        var authorId = Guid.NewGuid();
        var organisationId = Guid.NewGuid();
        var proposal = ProposalEntity.Create(proposalId, "Title", "Short", authorId, organisationId, "Long", null);
        _proposalRepository.GetByIdAsync(proposalId, Arg.Any<CancellationToken>()).Returns(proposal);

        var command = new DeleteProposalCommand(proposalId);

        var result = await _handler.Handle(command, CancellationToken.None);

        Assert.Equal(Unit.Value, result);
        await _proposalRepository.Received(1).DeleteAsync(proposalId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_ProposalNotFound_ThrowsNotFoundException()
    {
        var proposalId = Guid.NewGuid();
        _proposalRepository.GetByIdAsync(proposalId, Arg.Any<CancellationToken>()).Returns((ProposalEntity?)null);

        var command = new DeleteProposalCommand(proposalId);

        await Assert.ThrowsAsync<NotFoundException>(() => _handler.Handle(command, CancellationToken.None));
        await _proposalRepository.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }
}
