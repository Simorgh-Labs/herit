using Herit.Application.Exceptions;
using Herit.Application.Features.Proposal.Commands.UpdateProposalStatus;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using MediatR;
using NSubstitute;
using ProposalEntity = Herit.Domain.Entities.Proposal;
using UserEntity = Herit.Domain.Entities.User;

namespace Herit.Application.Tests.Features.Proposal.Commands;

public class UpdateProposalStatusCommandHandlerTests
{
    private readonly IProposalRepository _proposalRepository = Substitute.For<IProposalRepository>();
    private readonly ICurrentUserService _currentUserService = Substitute.For<ICurrentUserService>();
    private readonly UpdateProposalStatusCommandHandler _handler;

    private static readonly Guid AuthorId = Guid.NewGuid();

    public UpdateProposalStatusCommandHandlerTests()
    {
        _handler = new UpdateProposalStatusCommandHandler(_proposalRepository, _currentUserService);
    }

    private static ProposalEntity CreateIdeationProposal(Guid id)
        => ProposalEntity.Create(id, "Title", "Short", AuthorId, Guid.NewGuid(), "Long");

    private static UserEntity CreateUser(Guid id, UserRole role)
        => UserEntity.Create(id, $"ext-{id}", "user@example.com", "Test User", role);

    private void SetCurrentUser(UserEntity user)
        => _currentUserService.GetCurrentUserAsync(Arg.Any<CancellationToken>()).Returns(user);

    [Fact]
    public async Task Handle_IdeationToResourcing_AsOwner_CallsUpdateAsyncOnce()
    {
        var id = Guid.NewGuid();
        var proposal = CreateIdeationProposal(id);
        _proposalRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(proposal);
        SetCurrentUser(CreateUser(AuthorId, UserRole.Expat));

        var result = await _handler.Handle(new UpdateProposalStatusCommand(id, ProposalStatus.Resourcing), CancellationToken.None);

        Assert.Equal(Unit.Value, result);
        Assert.Equal(ProposalStatus.Resourcing, proposal.Status);
        await _proposalRepository.Received(1).UpdateAsync(proposal, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_IdeationToResourcing_AsNonOwnerExpat_ThrowsForbiddenException()
    {
        var id = Guid.NewGuid();
        var proposal = CreateIdeationProposal(id);
        _proposalRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(proposal);
        SetCurrentUser(CreateUser(Guid.NewGuid(), UserRole.Expat));

        await Assert.ThrowsAsync<ForbiddenException>(
            () => _handler.Handle(new UpdateProposalStatusCommand(id, ProposalStatus.Resourcing), CancellationToken.None));
        await _proposalRepository.DidNotReceive().UpdateAsync(Arg.Any<ProposalEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_IdeationToResourcing_AsStaff_ThrowsForbiddenException()
    {
        var id = Guid.NewGuid();
        var proposal = CreateIdeationProposal(id);
        _proposalRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(proposal);
        SetCurrentUser(CreateUser(Guid.NewGuid(), UserRole.Staff));

        await Assert.ThrowsAsync<ForbiddenException>(
            () => _handler.Handle(new UpdateProposalStatusCommand(id, ProposalStatus.Resourcing), CancellationToken.None));
        await _proposalRepository.DidNotReceive().UpdateAsync(Arg.Any<ProposalEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_SubmittedToWithdrawn_AsOwner_CallsUpdateAsyncOnce()
    {
        var id = Guid.NewGuid();
        var proposal = CreateIdeationProposal(id);
        proposal.TransitionStatus(ProposalStatus.Resourcing);
        proposal.TransitionStatus(ProposalStatus.Submitted);
        _proposalRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(proposal);
        SetCurrentUser(CreateUser(AuthorId, UserRole.Expat));

        var result = await _handler.Handle(new UpdateProposalStatusCommand(id, ProposalStatus.Withdrawn), CancellationToken.None);

        Assert.Equal(Unit.Value, result);
        Assert.Equal(ProposalStatus.Withdrawn, proposal.Status);
        await _proposalRepository.Received(1).UpdateAsync(proposal, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_SubmittedToWithdrawn_AsStaff_ThrowsForbiddenException()
    {
        var id = Guid.NewGuid();
        var proposal = CreateIdeationProposal(id);
        proposal.TransitionStatus(ProposalStatus.Resourcing);
        proposal.TransitionStatus(ProposalStatus.Submitted);
        _proposalRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(proposal);
        SetCurrentUser(CreateUser(Guid.NewGuid(), UserRole.Staff));

        await Assert.ThrowsAsync<ForbiddenException>(
            () => _handler.Handle(new UpdateProposalStatusCommand(id, ProposalStatus.Withdrawn), CancellationToken.None));
        await _proposalRepository.DidNotReceive().UpdateAsync(Arg.Any<ProposalEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_SubmittedToUnderReview_AsStaff_CallsUpdateAsyncOnce()
    {
        var id = Guid.NewGuid();
        var proposal = CreateIdeationProposal(id);
        proposal.TransitionStatus(ProposalStatus.Resourcing);
        proposal.TransitionStatus(ProposalStatus.Submitted);
        _proposalRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(proposal);
        SetCurrentUser(CreateUser(Guid.NewGuid(), UserRole.Staff));

        var result = await _handler.Handle(new UpdateProposalStatusCommand(id, ProposalStatus.UnderReview), CancellationToken.None);

        Assert.Equal(Unit.Value, result);
        Assert.Equal(ProposalStatus.UnderReview, proposal.Status);
        await _proposalRepository.Received(1).UpdateAsync(proposal, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_SubmittedToUnderReview_AsOwner_ThrowsForbiddenException()
    {
        var id = Guid.NewGuid();
        var proposal = CreateIdeationProposal(id);
        proposal.TransitionStatus(ProposalStatus.Resourcing);
        proposal.TransitionStatus(ProposalStatus.Submitted);
        _proposalRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(proposal);
        SetCurrentUser(CreateUser(AuthorId, UserRole.Expat));

        await Assert.ThrowsAsync<ForbiddenException>(
            () => _handler.Handle(new UpdateProposalStatusCommand(id, ProposalStatus.UnderReview), CancellationToken.None));
        await _proposalRepository.DidNotReceive().UpdateAsync(Arg.Any<ProposalEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_UnderReviewToApproved_AsStaff_CallsUpdateAsyncOnce()
    {
        var id = Guid.NewGuid();
        var proposal = CreateIdeationProposal(id);
        proposal.TransitionStatus(ProposalStatus.Resourcing);
        proposal.TransitionStatus(ProposalStatus.Submitted);
        proposal.TransitionStatus(ProposalStatus.UnderReview);
        _proposalRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(proposal);
        SetCurrentUser(CreateUser(Guid.NewGuid(), UserRole.Staff));

        var result = await _handler.Handle(new UpdateProposalStatusCommand(id, ProposalStatus.Approved), CancellationToken.None);

        Assert.Equal(Unit.Value, result);
        Assert.Equal(ProposalStatus.Approved, proposal.Status);
        await _proposalRepository.Received(1).UpdateAsync(proposal, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_UnderReviewToApproved_AsOwner_ThrowsForbiddenException()
    {
        var id = Guid.NewGuid();
        var proposal = CreateIdeationProposal(id);
        proposal.TransitionStatus(ProposalStatus.Resourcing);
        proposal.TransitionStatus(ProposalStatus.Submitted);
        proposal.TransitionStatus(ProposalStatus.UnderReview);
        _proposalRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(proposal);
        SetCurrentUser(CreateUser(AuthorId, UserRole.Expat));

        await Assert.ThrowsAsync<ForbiddenException>(
            () => _handler.Handle(new UpdateProposalStatusCommand(id, ProposalStatus.Approved), CancellationToken.None));
        await _proposalRepository.DidNotReceive().UpdateAsync(Arg.Any<ProposalEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_ProposalNotFound_ThrowsNotFoundException()
    {
        var id = Guid.NewGuid();
        _proposalRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns((ProposalEntity?)null);

        await Assert.ThrowsAsync<NotFoundException>(
            () => _handler.Handle(new UpdateProposalStatusCommand(id, ProposalStatus.Resourcing), CancellationToken.None));
        await _proposalRepository.DidNotReceive().UpdateAsync(Arg.Any<ProposalEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_IllegalTransition_ThrowsInvalidOperationException()
    {
        var id = Guid.NewGuid();
        var proposal = CreateIdeationProposal(id); // status is Ideation; Approved is staff-authorized but sequence-illegal from here
        _proposalRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(proposal);
        SetCurrentUser(CreateUser(Guid.NewGuid(), UserRole.Staff));

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _handler.Handle(new UpdateProposalStatusCommand(id, ProposalStatus.Approved), CancellationToken.None));
        await _proposalRepository.DidNotReceive().UpdateAsync(Arg.Any<ProposalEntity>(), Arg.Any<CancellationToken>());
    }
}
