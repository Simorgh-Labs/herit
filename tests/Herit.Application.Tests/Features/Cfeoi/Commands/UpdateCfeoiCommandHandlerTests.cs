using Herit.Application.Exceptions;
using Herit.Application.Features.Cfeoi.Commands.UpdateCfeoi;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using NSubstitute;
using CfeoiEntity = Herit.Domain.Entities.Cfeoi;

namespace Herit.Application.Tests.Features.Cfeoi.Commands;

public class UpdateCfeoiCommandHandlerTests
{
    private readonly ICfeoiRepository _cfeoiRepository = Substitute.For<ICfeoiRepository>();
    private readonly UpdateCfeoiCommandHandler _handler;

    public UpdateCfeoiCommandHandlerTests()
    {
        _handler = new UpdateCfeoiCommandHandler(_cfeoiRepository);
    }

    private static CfeoiEntity CreateCfeoi(Guid id) =>
        CfeoiEntity.Create(id, "Original Title", "Original Desc", CfeoiResourceType.Human, Guid.NewGuid());

    [Fact]
    public async Task Handle_HappyPath_UpdatesFieldsAndCallsUpdateAsync()
    {
        var id = Guid.NewGuid();
        var cfeoi = CreateCfeoi(id);
        _cfeoiRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(cfeoi);

        var command = new UpdateCfeoiCommand(id, "New Title", "New Desc", CfeoiResourceType.NonHuman);

        var result = await _handler.Handle(command, CancellationToken.None);

        Assert.Equal(MediatR.Unit.Value, result);
        Assert.Equal("New Title", cfeoi.Title);
        Assert.Equal("New Desc", cfeoi.Description);
        Assert.Equal(CfeoiResourceType.NonHuman, cfeoi.ResourceType);
        await _cfeoiRepository.Received(1).UpdateAsync(cfeoi, Arg.Any<CancellationToken>());
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
