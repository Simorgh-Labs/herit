using Herit.Application.Exceptions;
using Herit.Application.Features.Eoi.Commands.SetEoiVisibility;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using MediatR;
using NSubstitute;
using EoiEntity = Herit.Domain.Entities.Eoi;

namespace Herit.Application.Tests.Features.Eoi.Commands;

public class SetEoiVisibilityCommandHandlerTests
{
    private readonly IEoiRepository _eoiRepository = Substitute.For<IEoiRepository>();
    private readonly SetEoiVisibilityCommandHandler _handler;

    public SetEoiVisibilityCommandHandlerTests()
    {
        _handler = new SetEoiVisibilityCommandHandler(_eoiRepository);
    }

    [Fact]
    public async Task Handle_HappyPath_SetsVisibilityAndCallsUpdateAsync()
    {
        var eoiId = Guid.NewGuid();
        var eoi = EoiEntity.Create(eoiId, Guid.NewGuid(), "Message", Guid.NewGuid());
        _eoiRepository.GetByIdAsync(eoiId, Arg.Any<CancellationToken>()).Returns(eoi);

        var result = await _handler.Handle(new SetEoiVisibilityCommand(eoiId, EoiVisibility.Shared), CancellationToken.None);

        Assert.Equal(Unit.Value, result);
        Assert.Equal(EoiVisibility.Shared, eoi.Visibility);
        await _eoiRepository.Received(1).UpdateAsync(eoi, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_EoiNotFound_ThrowsNotFoundException()
    {
        var eoiId = Guid.NewGuid();
        _eoiRepository.GetByIdAsync(eoiId, Arg.Any<CancellationToken>()).Returns((EoiEntity?)null);

        await Assert.ThrowsAsync<NotFoundException>(
            () => _handler.Handle(new SetEoiVisibilityCommand(eoiId, EoiVisibility.Shared), CancellationToken.None));
        await _eoiRepository.DidNotReceive().UpdateAsync(Arg.Any<EoiEntity>(), Arg.Any<CancellationToken>());
    }
}
