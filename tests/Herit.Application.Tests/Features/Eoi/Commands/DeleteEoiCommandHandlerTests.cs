using Herit.Application.Features.Eoi.Commands.DeleteEoi;
using Herit.Application.Interfaces;
using MediatR;
using NSubstitute;
using EoiEntity = Herit.Domain.Entities.Eoi;

namespace Herit.Application.Tests.Features.Eoi.Commands;

public class DeleteEoiCommandHandlerTests
{
    private readonly IEoiRepository _eoiRepository = Substitute.For<IEoiRepository>();
    private readonly DeleteEoiCommandHandler _handler;

    public DeleteEoiCommandHandlerTests()
    {
        _handler = new DeleteEoiCommandHandler(_eoiRepository);
    }

    [Fact]
    public async Task Handle_HappyPath_CallsDeleteAsync()
    {
        var eoiId = Guid.NewGuid();
        var eoi = EoiEntity.Create(eoiId, Guid.NewGuid(), "Message", Guid.NewGuid());
        _eoiRepository.GetByIdAsync(eoiId, Arg.Any<CancellationToken>()).Returns(eoi);

        var result = await _handler.Handle(new DeleteEoiCommand(eoiId), CancellationToken.None);

        Assert.Equal(Unit.Value, result);
        await _eoiRepository.Received(1).DeleteAsync(eoiId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_EoiNotFound_ThrowsInvalidOperationException()
    {
        var eoiId = Guid.NewGuid();
        _eoiRepository.GetByIdAsync(eoiId, Arg.Any<CancellationToken>()).Returns((EoiEntity?)null);

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _handler.Handle(new DeleteEoiCommand(eoiId), CancellationToken.None));
        await _eoiRepository.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }
}
