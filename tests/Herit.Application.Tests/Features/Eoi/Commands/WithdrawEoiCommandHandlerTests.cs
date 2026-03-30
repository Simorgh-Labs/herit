using Herit.Application.Exceptions;
using Herit.Application.Features.Eoi.Commands.WithdrawEoi;
using Herit.Application.Interfaces;
using MediatR;
using NSubstitute;
using EoiEntity = Herit.Domain.Entities.Eoi;

namespace Herit.Application.Tests.Features.Eoi.Commands;

public class WithdrawEoiCommandHandlerTests
{
    private readonly IEoiRepository _eoiRepository = Substitute.For<IEoiRepository>();
    private readonly WithdrawEoiCommandHandler _handler;

    public WithdrawEoiCommandHandlerTests()
    {
        _handler = new WithdrawEoiCommandHandler(_eoiRepository);
    }

    [Fact]
    public async Task Handle_HappyPath_CallsDeleteAsync()
    {
        var eoiId = Guid.NewGuid();
        var eoi = EoiEntity.Create(eoiId, Guid.NewGuid(), "Message", Guid.NewGuid());
        _eoiRepository.GetByIdAsync(eoiId, Arg.Any<CancellationToken>()).Returns(eoi);

        var result = await _handler.Handle(new WithdrawEoiCommand(eoiId), CancellationToken.None);

        Assert.Equal(Unit.Value, result);
        await _eoiRepository.Received(1).DeleteAsync(eoiId, Arg.Any<CancellationToken>());
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
