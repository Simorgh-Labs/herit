using Herit.Application.Exceptions;
using Herit.Application.Features.Eoi.Commands.UpdateEoiStatus;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using NSubstitute;
using EoiEntity = Herit.Domain.Entities.Eoi;

namespace Herit.Application.Tests.Features.Eoi.Commands;

public class UpdateEoiStatusCommandHandlerTests
{
    private readonly IEoiRepository _repository = Substitute.For<IEoiRepository>();
    private readonly UpdateEoiStatusCommandHandler _handler;

    public UpdateEoiStatusCommandHandlerTests()
    {
        _handler = new UpdateEoiStatusCommandHandler(_repository);
    }

    private static EoiEntity CreatePendingEoi(Guid id)
        => EoiEntity.Create(id, Guid.NewGuid(), "Message", Guid.NewGuid());

    [Fact]
    public async Task Handle_PendingToApproved_CallsUpdateAsyncOnce()
    {
        var id = Guid.NewGuid();
        var eoi = CreatePendingEoi(id);
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(eoi);

        var result = await _handler.Handle(new UpdateEoiStatusCommand(id, EoiStatus.Approved), CancellationToken.None);

        Assert.Equal(MediatR.Unit.Value, result);
        Assert.Equal(EoiStatus.Approved, eoi.Status);
        await _repository.Received(1).UpdateAsync(eoi, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_PendingToRejected_CallsUpdateAsyncOnce()
    {
        var id = Guid.NewGuid();
        var eoi = CreatePendingEoi(id);
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(eoi);

        var result = await _handler.Handle(new UpdateEoiStatusCommand(id, EoiStatus.Rejected), CancellationToken.None);

        Assert.Equal(MediatR.Unit.Value, result);
        Assert.Equal(EoiStatus.Rejected, eoi.Status);
        await _repository.Received(1).UpdateAsync(eoi, Arg.Any<CancellationToken>());
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

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _handler.Handle(new UpdateEoiStatusCommand(id, EoiStatus.Pending), CancellationToken.None));
        await _repository.DidNotReceive().UpdateAsync(Arg.Any<EoiEntity>(), Arg.Any<CancellationToken>());
    }
}
