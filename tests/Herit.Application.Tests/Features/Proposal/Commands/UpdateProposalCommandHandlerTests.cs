using Herit.Application.Exceptions;
using Herit.Application.Features.Proposal.Commands.UpdateProposal;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using MediatR;
using NSubstitute;
using ProposalEntity = Herit.Domain.Entities.Proposal;
using UserEntity = Herit.Domain.Entities.User;
using OrganisationEntity = Herit.Domain.Entities.Organisation;

namespace Herit.Application.Tests.Features.Proposal.Commands;

public class UpdateProposalCommandHandlerTests
{
    private readonly IProposalRepository _proposalRepository = Substitute.For<IProposalRepository>();
    private readonly UpdateProposalCommandHandler _handler;

    public UpdateProposalCommandHandlerTests()
    {
        _handler = new UpdateProposalCommandHandler(_proposalRepository);
    }

    [Fact]
    public async Task Handle_HappyPath_UpdatesProposalAndCallsUpdateAsync()
    {
        var proposalId = Guid.NewGuid();
        var authorId = Guid.NewGuid();
        var organisationId = Guid.NewGuid();
        var proposal = ProposalEntity.Create(proposalId, "Old Title", "Old Short", authorId, organisationId, "Old Long", null);
        _proposalRepository.GetByIdAsync(proposalId, Arg.Any<CancellationToken>()).Returns(proposal);

        var command = new UpdateProposalCommand(proposalId, "New Title", "New Short", "New Long");

        var result = await _handler.Handle(command, CancellationToken.None);

        Assert.Equal(Unit.Value, result);
        await _proposalRepository.Received(1).UpdateAsync(
            Arg.Is<ProposalEntity>(p => p.Title == "New Title" && p.ShortDescription == "New Short" && p.LongDescription == "New Long"),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_ProposalNotFound_ThrowsNotFoundException()
    {
        var proposalId = Guid.NewGuid();
        _proposalRepository.GetByIdAsync(proposalId, Arg.Any<CancellationToken>()).Returns((ProposalEntity?)null);

        var command = new UpdateProposalCommand(proposalId, "Title", "Short", "Long");

        await Assert.ThrowsAsync<NotFoundException>(() => _handler.Handle(command, CancellationToken.None));
        await _proposalRepository.DidNotReceive().UpdateAsync(Arg.Any<ProposalEntity>(), Arg.Any<CancellationToken>());
    }
}
