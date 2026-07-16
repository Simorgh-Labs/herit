using Herit.Application.Exceptions;
using Herit.Application.Features.Eoi.Commands.WithdrawEoi;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using MediatR;
using NSubstitute;
using EoiEntity = Herit.Domain.Entities.Eoi;
using UserEntity = Herit.Domain.Entities.User;

namespace Herit.Application.Tests.Features.Eoi.Commands;

public class WithdrawEoiCommandHandlerTests
{
    private readonly IEoiRepository _eoiRepository = Substitute.For<IEoiRepository>();
    private readonly ICurrentUserService _currentUserService = Substitute.For<ICurrentUserService>();
    private readonly WithdrawEoiCommandHandler _handler;

    public WithdrawEoiCommandHandlerTests()
    {
        _handler = new WithdrawEoiCommandHandler(_eoiRepository, _currentUserService);
    }

    private static UserEntity CreateUser(Guid id, UserRole role)
        => UserEntity.Create(id, $"ext-{id}", "user@example.com", "Test User", role);

    private void SetCurrentUser(UserEntity user)
        => _currentUserService.GetCurrentUserAsync(Arg.Any<CancellationToken>()).Returns(user);

    [Fact]
    public async Task Handle_AsSubmitter_CallsDeleteAsync()
    {
        var eoiId = Guid.NewGuid();
        var submitterId = Guid.NewGuid();
        var eoi = EoiEntity.Create(eoiId, submitterId, "Message", Guid.NewGuid());
        _eoiRepository.GetByIdAsync(eoiId, Arg.Any<CancellationToken>()).Returns(eoi);
        SetCurrentUser(CreateUser(submitterId, UserRole.Expat));

        var result = await _handler.Handle(new WithdrawEoiCommand(eoiId), CancellationToken.None);

        Assert.Equal(Unit.Value, result);
        await _eoiRepository.Received(1).DeleteAsync(eoiId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_AsNonSubmitter_ThrowsForbiddenException()
    {
        var eoiId = Guid.NewGuid();
        var eoi = EoiEntity.Create(eoiId, Guid.NewGuid(), "Message", Guid.NewGuid());
        _eoiRepository.GetByIdAsync(eoiId, Arg.Any<CancellationToken>()).Returns(eoi);
        SetCurrentUser(CreateUser(Guid.NewGuid(), UserRole.Expat));

        await Assert.ThrowsAsync<ForbiddenException>(
            () => _handler.Handle(new WithdrawEoiCommand(eoiId), CancellationToken.None));
        await _eoiRepository.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_AsStaffNonSubmitter_ThrowsForbiddenException()
    {
        var eoiId = Guid.NewGuid();
        var eoi = EoiEntity.Create(eoiId, Guid.NewGuid(), "Message", Guid.NewGuid());
        _eoiRepository.GetByIdAsync(eoiId, Arg.Any<CancellationToken>()).Returns(eoi);
        SetCurrentUser(CreateUser(Guid.NewGuid(), UserRole.Staff));

        await Assert.ThrowsAsync<ForbiddenException>(
            () => _handler.Handle(new WithdrawEoiCommand(eoiId), CancellationToken.None));
        await _eoiRepository.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_EoiNotFound_ThrowsNotFoundException()
    {
        var eoiId = Guid.NewGuid();
        _eoiRepository.GetByIdAsync(eoiId, Arg.Any<CancellationToken>()).Returns((EoiEntity?)null);

        await Assert.ThrowsAsync<NotFoundException>(
            () => _handler.Handle(new WithdrawEoiCommand(eoiId), CancellationToken.None));
        await _eoiRepository.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }
}
