using Herit.Application.Exceptions;
using Herit.Application.Features.Proposal.Commands.SetProposalVisibility;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using MediatR;
using NSubstitute;
using ProposalEntity = Herit.Domain.Entities.Proposal;
using UserEntity = Herit.Domain.Entities.User;

namespace Herit.Application.Tests.Features.Proposal.Commands;

public class SetProposalVisibilityCommandHandlerTests
{
    private readonly IProposalRepository _proposalRepository = Substitute.For<IProposalRepository>();
    private readonly ICurrentUserService _currentUserService = Substitute.For<ICurrentUserService>();
    private readonly SetProposalVisibilityCommandHandler _handler;

    public SetProposalVisibilityCommandHandlerTests()
    {
        _handler = new SetProposalVisibilityCommandHandler(_proposalRepository, _currentUserService);
    }

    private static UserEntity CreateUser(Guid id, UserRole role)
        => UserEntity.Create(id, $"ext-{id}", "user@example.com", "Test User", role);

    private void SetCurrentUser(UserEntity user)
        => _currentUserService.GetCurrentUserAsync(Arg.Any<CancellationToken>()).Returns(user);

    [Fact]
    public async Task Handle_AsOwner_SetsVisibilityAndCallsUpdateAsync()
    {
        var proposalId = Guid.NewGuid();
        var authorId = Guid.NewGuid();
        var proposal = ProposalEntity.Create(proposalId, "Title", "Short", authorId, Guid.NewGuid(), "Long");
        _proposalRepository.GetByIdAsync(proposalId, Arg.Any<CancellationToken>()).Returns(proposal);
        SetCurrentUser(CreateUser(authorId, UserRole.Expat));

        var result = await _handler.Handle(new SetProposalVisibilityCommand(proposalId, ProposalVisibility.Public), CancellationToken.None);

        Assert.Equal(Unit.Value, result);
        Assert.Equal(ProposalVisibility.Public, proposal.Visibility);
        await _proposalRepository.Received(1).UpdateAsync(
            Arg.Is<ProposalEntity>(p => p.Visibility == ProposalVisibility.Public),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_AsNonOwner_ThrowsForbiddenException()
    {
        var proposalId = Guid.NewGuid();
        var authorId = Guid.NewGuid();
        var proposal = ProposalEntity.Create(proposalId, "Title", "Short", authorId, Guid.NewGuid(), "Long");
        _proposalRepository.GetByIdAsync(proposalId, Arg.Any<CancellationToken>()).Returns(proposal);
        SetCurrentUser(CreateUser(Guid.NewGuid(), UserRole.Expat));

        await Assert.ThrowsAsync<ForbiddenException>(
            () => _handler.Handle(new SetProposalVisibilityCommand(proposalId, ProposalVisibility.Public), CancellationToken.None));
        await _proposalRepository.DidNotReceive().UpdateAsync(Arg.Any<ProposalEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_ProposalNotFound_ThrowsNotFoundException()
    {
        var proposalId = Guid.NewGuid();
        _proposalRepository.GetByIdAsync(proposalId, Arg.Any<CancellationToken>()).Returns((ProposalEntity?)null);

        await Assert.ThrowsAsync<NotFoundException>(
            () => _handler.Handle(new SetProposalVisibilityCommand(proposalId, ProposalVisibility.Public), CancellationToken.None));
        await _proposalRepository.DidNotReceive().UpdateAsync(Arg.Any<ProposalEntity>(), Arg.Any<CancellationToken>());
    }
}
