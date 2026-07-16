using Herit.Application.Exceptions;
using Herit.Application.Features.Eoi.Commands.UpdateEoiStatus;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using NSubstitute;
using CfeoiEntity = Herit.Domain.Entities.Cfeoi;
using EoiEntity = Herit.Domain.Entities.Eoi;
using ProposalEntity = Herit.Domain.Entities.Proposal;
using UserEntity = Herit.Domain.Entities.User;

namespace Herit.Application.Tests.Features.Eoi.Commands;

public class UpdateEoiStatusCommandHandlerTests
{
    private readonly IEoiRepository _repository = Substitute.For<IEoiRepository>();
    private readonly ICfeoiRepository _cfeoiRepository = Substitute.For<ICfeoiRepository>();
    private readonly IProposalRepository _proposalRepository = Substitute.For<IProposalRepository>();
    private readonly ICurrentUserService _currentUserService = Substitute.For<ICurrentUserService>();
    private readonly UpdateEoiStatusCommandHandler _handler;

    private static readonly Guid OwnerId = Guid.NewGuid();
    private static readonly Guid CfeoiId = Guid.NewGuid();
    private static readonly Guid ProposalId = Guid.NewGuid();

    public UpdateEoiStatusCommandHandlerTests()
    {
        _handler = new UpdateEoiStatusCommandHandler(_repository, _cfeoiRepository, _proposalRepository, _currentUserService);
    }

    private static EoiEntity CreatePendingEoi(Guid id)
        => EoiEntity.Create(id, Guid.NewGuid(), "Message", CfeoiId);

    private static UserEntity CreateUser(Guid id, UserRole role)
        => UserEntity.Create(id, $"ext-{id}", "user@example.com", "Test User", role);

    private void SetCurrentUser(UserEntity user)
        => _currentUserService.GetCurrentUserAsync(Arg.Any<CancellationToken>()).Returns(user);

    private void SetUpOwnedProposalChain()
    {
        _cfeoiRepository.GetByIdAsync(CfeoiId, Arg.Any<CancellationToken>())
            .Returns(CfeoiEntity.Create(CfeoiId, "Title", "Description", CfeoiResourceType.Human, ProposalId));
        _proposalRepository.GetByIdAsync(ProposalId, Arg.Any<CancellationToken>())
            .Returns(ProposalEntity.Create(ProposalId, "Title", "Short", OwnerId, Guid.NewGuid(), "Long"));
    }

    [Fact]
    public async Task Handle_PendingToApproved_AsStaff_CallsUpdateAsyncOnce()
    {
        var id = Guid.NewGuid();
        var eoi = CreatePendingEoi(id);
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(eoi);
        SetCurrentUser(CreateUser(Guid.NewGuid(), UserRole.Staff));

        var result = await _handler.Handle(new UpdateEoiStatusCommand(id, EoiStatus.Approved), CancellationToken.None);

        Assert.Equal(MediatR.Unit.Value, result);
        Assert.Equal(EoiStatus.Approved, eoi.Status);
        await _repository.Received(1).UpdateAsync(eoi, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_PendingToRejected_AsStaff_CallsUpdateAsyncOnce()
    {
        var id = Guid.NewGuid();
        var eoi = CreatePendingEoi(id);
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(eoi);
        SetCurrentUser(CreateUser(Guid.NewGuid(), UserRole.Staff));

        var result = await _handler.Handle(new UpdateEoiStatusCommand(id, EoiStatus.Rejected), CancellationToken.None);

        Assert.Equal(MediatR.Unit.Value, result);
        Assert.Equal(EoiStatus.Rejected, eoi.Status);
        await _repository.Received(1).UpdateAsync(eoi, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_AsExpatProposalOwner_CallsUpdateAsyncOnce()
    {
        var id = Guid.NewGuid();
        var eoi = CreatePendingEoi(id);
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(eoi);
        SetCurrentUser(CreateUser(OwnerId, UserRole.Expat));
        SetUpOwnedProposalChain();

        var result = await _handler.Handle(new UpdateEoiStatusCommand(id, EoiStatus.Approved), CancellationToken.None);

        Assert.Equal(MediatR.Unit.Value, result);
        Assert.Equal(EoiStatus.Approved, eoi.Status);
        await _repository.Received(1).UpdateAsync(eoi, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_AsExpatNonOwner_ThrowsForbiddenException()
    {
        var id = Guid.NewGuid();
        var eoi = CreatePendingEoi(id);
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(eoi);
        SetCurrentUser(CreateUser(Guid.NewGuid(), UserRole.Expat));
        SetUpOwnedProposalChain();

        await Assert.ThrowsAsync<ForbiddenException>(
            () => _handler.Handle(new UpdateEoiStatusCommand(id, EoiStatus.Approved), CancellationToken.None));
        await _repository.DidNotReceive().UpdateAsync(Arg.Any<EoiEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_EoiNotFound_ThrowsNotFoundException()
    {
        var id = Guid.NewGuid();
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns((EoiEntity?)null);

        await Assert.ThrowsAsync<NotFoundException>(
            () => _handler.Handle(new UpdateEoiStatusCommand(id, EoiStatus.Approved), CancellationToken.None));
        await _repository.DidNotReceive().UpdateAsync(Arg.Any<EoiEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_IllegalTransition_ThrowsInvalidOperationException()
    {
        var id = Guid.NewGuid();
        var eoi = CreatePendingEoi(id);
        eoi.TransitionStatus(EoiStatus.Approved);
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(eoi);
        SetCurrentUser(CreateUser(Guid.NewGuid(), UserRole.Staff));

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _handler.Handle(new UpdateEoiStatusCommand(id, EoiStatus.Pending), CancellationToken.None));
        await _repository.DidNotReceive().UpdateAsync(Arg.Any<EoiEntity>(), Arg.Any<CancellationToken>());
    }
}
