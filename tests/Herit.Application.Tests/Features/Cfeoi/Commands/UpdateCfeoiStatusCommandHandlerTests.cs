using Herit.Application.Exceptions;
using Herit.Application.Features.Cfeoi.Commands.UpdateCfeoiStatus;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using NSubstitute;
using CfeoiEntity = Herit.Domain.Entities.Cfeoi;
using ProposalEntity = Herit.Domain.Entities.Proposal;
using UserEntity = Herit.Domain.Entities.User;

namespace Herit.Application.Tests.Features.Cfeoi.Commands;

public class UpdateCfeoiStatusCommandHandlerTests
{
    private readonly ICfeoiRepository _repository = Substitute.For<ICfeoiRepository>();
    private readonly IProposalRepository _proposalRepository = Substitute.For<IProposalRepository>();
    private readonly ICurrentUserService _currentUserService = Substitute.For<ICurrentUserService>();
    private readonly UpdateCfeoiStatusCommandHandler _handler;

    private static readonly Guid ProposalId = Guid.NewGuid();
    private static readonly Guid OwnerId = Guid.NewGuid();

    public UpdateCfeoiStatusCommandHandlerTests()
    {
        _handler = new UpdateCfeoiStatusCommandHandler(_repository, _proposalRepository, _currentUserService);
    }

    private static CfeoiEntity CreateOpenCfeoi(Guid id)
        => CfeoiEntity.Create(id, "Title", "Description", CfeoiResourceType.Human, ProposalId);

    private static UserEntity CreateUser(Guid id, UserRole role)
        => UserEntity.Create(id, $"ext-{id}", "user@example.com", "Test User", role);

    private void SetCurrentUser(UserEntity user)
        => _currentUserService.GetCurrentUserAsync(Arg.Any<CancellationToken>()).Returns(user);

    private void SetUpOwnedProposal()
        => _proposalRepository.GetByIdAsync(ProposalId, Arg.Any<CancellationToken>())
            .Returns(ProposalEntity.Create(ProposalId, "Title", "Short", OwnerId, Guid.NewGuid(), "Long"));

    [Fact]
    public async Task Handle_OpenToClosed_AsProposalOwner_CallsUpdateAsyncOnce()
    {
        var id = Guid.NewGuid();
        var cfeoi = CreateOpenCfeoi(id);
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(cfeoi);
        SetCurrentUser(CreateUser(OwnerId, UserRole.Expat));
        SetUpOwnedProposal();

        var result = await _handler.Handle(new UpdateCfeoiStatusCommand(id, CfeoiStatus.Closed), CancellationToken.None);

        Assert.Equal(MediatR.Unit.Value, result);
        Assert.Equal(CfeoiStatus.Closed, cfeoi.Status);
        await _repository.Received(1).UpdateAsync(cfeoi, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_OpenToClosed_AsStaff_CallsUpdateAsyncOnce()
    {
        var id = Guid.NewGuid();
        var cfeoi = CreateOpenCfeoi(id);
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(cfeoi);
        SetCurrentUser(CreateUser(Guid.NewGuid(), UserRole.Staff));
        SetUpOwnedProposal();

        var result = await _handler.Handle(new UpdateCfeoiStatusCommand(id, CfeoiStatus.Closed), CancellationToken.None);

        Assert.Equal(MediatR.Unit.Value, result);
        await _repository.Received(1).UpdateAsync(cfeoi, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_OpenToClosed_AsNonOwnerExpat_ThrowsForbiddenException()
    {
        var id = Guid.NewGuid();
        var cfeoi = CreateOpenCfeoi(id);
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(cfeoi);
        SetCurrentUser(CreateUser(Guid.NewGuid(), UserRole.Expat));
        SetUpOwnedProposal();

        await Assert.ThrowsAsync<ForbiddenException>(
            () => _handler.Handle(new UpdateCfeoiStatusCommand(id, CfeoiStatus.Closed), CancellationToken.None));
        await _repository.DidNotReceive().UpdateAsync(Arg.Any<CfeoiEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_CfeoiNotFound_ThrowsNotFoundException()
    {
        var id = Guid.NewGuid();
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns((CfeoiEntity?)null);

        await Assert.ThrowsAsync<NotFoundException>(
            () => _handler.Handle(new UpdateCfeoiStatusCommand(id, CfeoiStatus.Closed), CancellationToken.None));
        await _repository.DidNotReceive().UpdateAsync(Arg.Any<CfeoiEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_IllegalTransition_ThrowsInvalidOperationException()
    {
        var id = Guid.NewGuid();
        var cfeoi = CreateOpenCfeoi(id);
        cfeoi.TransitionStatus(CfeoiStatus.Closed);
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(cfeoi);
        SetCurrentUser(CreateUser(OwnerId, UserRole.Expat));
        SetUpOwnedProposal();

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _handler.Handle(new UpdateCfeoiStatusCommand(id, CfeoiStatus.Open), CancellationToken.None));
        await _repository.DidNotReceive().UpdateAsync(Arg.Any<CfeoiEntity>(), Arg.Any<CancellationToken>());
    }
}
