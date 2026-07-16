using Herit.Application.Exceptions;
using Herit.Application.Features.Cfeoi.Commands.UpdateCfeoi;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using NSubstitute;
using CfeoiEntity = Herit.Domain.Entities.Cfeoi;
using ProposalEntity = Herit.Domain.Entities.Proposal;
using UserEntity = Herit.Domain.Entities.User;

namespace Herit.Application.Tests.Features.Cfeoi.Commands;

public class UpdateCfeoiCommandHandlerTests
{
    private readonly ICfeoiRepository _cfeoiRepository = Substitute.For<ICfeoiRepository>();
    private readonly IProposalRepository _proposalRepository = Substitute.For<IProposalRepository>();
    private readonly ICurrentUserService _currentUserService = Substitute.For<ICurrentUserService>();
    private readonly UpdateCfeoiCommandHandler _handler;

    private static readonly Guid ProposalId = Guid.NewGuid();
    private static readonly Guid OwnerId = Guid.NewGuid();

    public UpdateCfeoiCommandHandlerTests()
    {
        _handler = new UpdateCfeoiCommandHandler(_cfeoiRepository, _proposalRepository, _currentUserService);
    }

    private static CfeoiEntity CreateCfeoi(Guid id) =>
        CfeoiEntity.Create(id, "Original Title", "Original Desc", CfeoiResourceType.Human, ProposalId);

    private static UserEntity CreateUser(Guid id, UserRole role)
        => UserEntity.Create(id, $"ext-{id}", "user@example.com", "Test User", role);

    private void SetCurrentUser(UserEntity user)
        => _currentUserService.GetCurrentUserAsync(Arg.Any<CancellationToken>()).Returns(user);

    private void SetUpOwnedProposal()
        => _proposalRepository.GetByIdAsync(ProposalId, Arg.Any<CancellationToken>())
            .Returns(ProposalEntity.Create(ProposalId, "Title", "Short", OwnerId, Guid.NewGuid(), "Long"));

    [Fact]
    public async Task Handle_AsProposalOwner_UpdatesFieldsAndCallsUpdateAsync()
    {
        var id = Guid.NewGuid();
        var cfeoi = CreateCfeoi(id);
        _cfeoiRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(cfeoi);
        SetCurrentUser(CreateUser(OwnerId, UserRole.Expat));
        SetUpOwnedProposal();

        var command = new UpdateCfeoiCommand(id, "New Title", "New Desc", CfeoiResourceType.NonHuman, "music,dance");

        var result = await _handler.Handle(command, CancellationToken.None);

        Assert.Equal(MediatR.Unit.Value, result);
        Assert.Equal("New Title", cfeoi.Title);
        Assert.Equal("New Desc", cfeoi.Description);
        Assert.Equal(CfeoiResourceType.NonHuman, cfeoi.ResourceType);
        Assert.Equal("music,dance", cfeoi.Tags);
        await _cfeoiRepository.Received(1).UpdateAsync(cfeoi, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_AsStaff_UpdatesFieldsAndCallsUpdateAsync()
    {
        var id = Guid.NewGuid();
        var cfeoi = CreateCfeoi(id);
        _cfeoiRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(cfeoi);
        SetCurrentUser(CreateUser(Guid.NewGuid(), UserRole.Staff));
        SetUpOwnedProposal();

        var command = new UpdateCfeoiCommand(id, "New Title", "New Desc", CfeoiResourceType.NonHuman, "music,dance");

        var result = await _handler.Handle(command, CancellationToken.None);

        Assert.Equal(MediatR.Unit.Value, result);
        await _cfeoiRepository.Received(1).UpdateAsync(cfeoi, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_AsNonOwnerExpat_ThrowsForbiddenException()
    {
        var id = Guid.NewGuid();
        var cfeoi = CreateCfeoi(id);
        _cfeoiRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(cfeoi);
        SetCurrentUser(CreateUser(Guid.NewGuid(), UserRole.Expat));
        SetUpOwnedProposal();

        var command = new UpdateCfeoiCommand(id, "New Title", "New Desc", CfeoiResourceType.NonHuman, "music,dance");

        await Assert.ThrowsAsync<ForbiddenException>(() => _handler.Handle(command, CancellationToken.None));
        await _cfeoiRepository.DidNotReceive().UpdateAsync(Arg.Any<CfeoiEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_CfeoiNotFound_ThrowsNotFoundException()
    {
        var id = Guid.NewGuid();
        _cfeoiRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns((CfeoiEntity?)null);

        var command = new UpdateCfeoiCommand(id, "T", "D", CfeoiResourceType.Human);

        await Assert.ThrowsAsync<NotFoundException>(() => _handler.Handle(command, CancellationToken.None));
        await _cfeoiRepository.DidNotReceive().UpdateAsync(Arg.Any<CfeoiEntity>(), Arg.Any<CancellationToken>());
    }
}
