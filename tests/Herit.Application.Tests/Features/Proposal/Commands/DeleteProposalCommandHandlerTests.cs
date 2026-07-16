using Herit.Application.Exceptions;
using Herit.Application.Features.Proposal.Commands.DeleteProposal;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using MediatR;
using NSubstitute;
using ProposalEntity = Herit.Domain.Entities.Proposal;
using UserEntity = Herit.Domain.Entities.User;

namespace Herit.Application.Tests.Features.Proposal.Commands;

public class DeleteProposalCommandHandlerTests
{
    private readonly IProposalRepository _proposalRepository = Substitute.For<IProposalRepository>();
    private readonly ICurrentUserService _currentUserService = Substitute.For<ICurrentUserService>();
    private readonly DeleteProposalCommandHandler _handler;

    public DeleteProposalCommandHandlerTests()
    {
        _handler = new DeleteProposalCommandHandler(_proposalRepository, _currentUserService);
    }

    private static UserEntity CreateUser(Guid id, UserRole role)
        => UserEntity.Create(id, $"ext-{id}", "user@example.com", "Test User", role);

    private void SetCurrentUser(UserEntity user)
        => _currentUserService.GetCurrentUserAsync(Arg.Any<CancellationToken>()).Returns(user);

    [Fact]
    public async Task Handle_AsOwner_CallsDeleteAsync()
    {
        var proposalId = Guid.NewGuid();
        var authorId = Guid.NewGuid();
        var organisationId = Guid.NewGuid();
        var proposal = ProposalEntity.Create(proposalId, "Title", "Short", authorId, organisationId, "Long", null);
        _proposalRepository.GetByIdAsync(proposalId, Arg.Any<CancellationToken>()).Returns(proposal);
        SetCurrentUser(CreateUser(authorId, UserRole.Expat));

        var result = await _handler.Handle(new DeleteProposalCommand(proposalId), CancellationToken.None);

        Assert.Equal(Unit.Value, result);
        await _proposalRepository.Received(1).DeleteAsync(proposalId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_AsStaffNonOwner_CallsDeleteAsync()
    {
        var proposalId = Guid.NewGuid();
        var authorId = Guid.NewGuid();
        var organisationId = Guid.NewGuid();
        var proposal = ProposalEntity.Create(proposalId, "Title", "Short", authorId, organisationId, "Long", null);
        _proposalRepository.GetByIdAsync(proposalId, Arg.Any<CancellationToken>()).Returns(proposal);
        SetCurrentUser(CreateUser(Guid.NewGuid(), UserRole.Staff));

        var result = await _handler.Handle(new DeleteProposalCommand(proposalId), CancellationToken.None);

        Assert.Equal(Unit.Value, result);
        await _proposalRepository.Received(1).DeleteAsync(proposalId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_AsNonOwnerExpat_ThrowsForbiddenException()
    {
        var proposalId = Guid.NewGuid();
        var authorId = Guid.NewGuid();
        var organisationId = Guid.NewGuid();
        var proposal = ProposalEntity.Create(proposalId, "Title", "Short", authorId, organisationId, "Long", null);
        _proposalRepository.GetByIdAsync(proposalId, Arg.Any<CancellationToken>()).Returns(proposal);
        SetCurrentUser(CreateUser(Guid.NewGuid(), UserRole.Expat));

        await Assert.ThrowsAsync<ForbiddenException>(
            () => _handler.Handle(new DeleteProposalCommand(proposalId), CancellationToken.None));
        await _proposalRepository.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
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
