using Herit.Application.Exceptions;
using Herit.Application.Features.Eoi.Commands.SubmitEoi;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using NSubstitute;
using CfeoiEntity = Herit.Domain.Entities.Cfeoi;
using EoiEntity = Herit.Domain.Entities.Eoi;
using UserEntity = Herit.Domain.Entities.User;

namespace Herit.Application.Tests.Features.Eoi.Commands;

public class SubmitEoiCommandHandlerTests
{
    private readonly IEoiRepository _eoiRepository = Substitute.For<IEoiRepository>();
    private readonly IUserRepository _userRepository = Substitute.For<IUserRepository>();
    private readonly ICfeoiRepository _cfeoiRepository = Substitute.For<ICfeoiRepository>();
    private readonly SubmitEoiCommandHandler _handler;

    public SubmitEoiCommandHandlerTests()
    {
        _handler = new SubmitEoiCommandHandler(_eoiRepository, _userRepository, _cfeoiRepository);
    }

    [Fact]
    public async Task Handle_HappyPath_ReturnsValidGuidAndCallsAddAsync()
    {
        var submittedById = Guid.NewGuid();
        var cfeoiId = Guid.NewGuid();
        _userRepository.GetByIdAsync(submittedById, Arg.Any<CancellationToken>())
            .Returns(UserEntity.Create(submittedById, "ext-1", "user@example.com", "Test User", UserRole.Staff));
        _cfeoiRepository.GetByIdAsync(cfeoiId, Arg.Any<CancellationToken>())
            .Returns(CfeoiEntity.Create(cfeoiId, "Title", "Desc", CfeoiResourceType.Human, Guid.NewGuid()));

        var command = new SubmitEoiCommand("My message", cfeoiId) with { SubmittedById = submittedById };

        var result = await _handler.Handle(command, CancellationToken.None);

        Assert.NotEqual(Guid.Empty, result);
        await _eoiRepository.Received(1).AddAsync(
            Arg.Is<EoiEntity>(e => e.SubmittedById == submittedById && e.CfeoiId == cfeoiId),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_UserNotFound_ThrowsNotFoundException()
    {
        var submittedById = Guid.NewGuid();
        _userRepository.GetByIdAsync(submittedById, Arg.Any<CancellationToken>()).Returns((UserEntity?)null);

        var command = new SubmitEoiCommand("Message", Guid.NewGuid()) with { SubmittedById = submittedById };

        await Assert.ThrowsAsync<NotFoundException>(() => _handler.Handle(command, CancellationToken.None));
        await _eoiRepository.DidNotReceive().AddAsync(Arg.Any<EoiEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_CfeoiNotFound_ThrowsNotFoundException()
    {
        var submittedById = Guid.NewGuid();
        var cfeoiId = Guid.NewGuid();
        _userRepository.GetByIdAsync(submittedById, Arg.Any<CancellationToken>())
            .Returns(UserEntity.Create(submittedById, "ext-1", "user@example.com", "Test User", UserRole.Staff));
        _cfeoiRepository.GetByIdAsync(cfeoiId, Arg.Any<CancellationToken>()).Returns((CfeoiEntity?)null);

        var command = new SubmitEoiCommand("Message", cfeoiId) with { SubmittedById = submittedById };

        await Assert.ThrowsAsync<NotFoundException>(() => _handler.Handle(command, CancellationToken.None));
        await _eoiRepository.DidNotReceive().AddAsync(Arg.Any<EoiEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_CfeoiNotOpen_ThrowsInvalidOperationException()
    {
        var submittedById = Guid.NewGuid();
        var cfeoiId = Guid.NewGuid();
        var closedCfeoi = CfeoiEntity.Create(cfeoiId, "Title", "Desc", CfeoiResourceType.Human, Guid.NewGuid());
        closedCfeoi.TransitionStatus(CfeoiStatus.Closed);
        _userRepository.GetByIdAsync(submittedById, Arg.Any<CancellationToken>())
            .Returns(UserEntity.Create(submittedById, "ext-1", "user@example.com", "Test User", UserRole.Staff));
        _cfeoiRepository.GetByIdAsync(cfeoiId, Arg.Any<CancellationToken>()).Returns(closedCfeoi);

        var command = new SubmitEoiCommand("Message", cfeoiId) with { SubmittedById = submittedById };

        await Assert.ThrowsAsync<InvalidOperationException>(() => _handler.Handle(command, CancellationToken.None));
        await _eoiRepository.DidNotReceive().AddAsync(Arg.Any<EoiEntity>(), Arg.Any<CancellationToken>());
    }
}
