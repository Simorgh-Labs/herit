using Herit.Application.Exceptions;
using Herit.Application.Features.Cfeoi.Commands.UpdateCfeoiStatus;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using NSubstitute;
using CfeoiEntity = Herit.Domain.Entities.Cfeoi;

namespace Herit.Application.Tests.Features.Cfeoi.Commands;

public class UpdateCfeoiStatusCommandHandlerTests
{
    private readonly ICfeoiRepository _repository = Substitute.For<ICfeoiRepository>();
    private readonly UpdateCfeoiStatusCommandHandler _handler;

    public UpdateCfeoiStatusCommandHandlerTests()
    {
        _handler = new UpdateCfeoiStatusCommandHandler(_repository);
    }

    private static CfeoiEntity CreateOpenCfeoi(Guid id)
        => CfeoiEntity.Create(id, "Title", "Description", CfeoiResourceType.Human, Guid.NewGuid(), "Engineer", "C#", 1);

    [Fact]
    public async Task Handle_OpenToClosed_CallsUpdateAsyncOnce()
    {
        var id = Guid.NewGuid();
        var cfeoi = CreateOpenCfeoi(id);
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(cfeoi);

        var result = await _handler.Handle(new UpdateCfeoiStatusCommand(id, CfeoiStatus.Closed), CancellationToken.None);

        Assert.Equal(MediatR.Unit.Value, result);
        Assert.Equal(CfeoiStatus.Closed, cfeoi.Status);
        await _repository.Received(1).UpdateAsync(cfeoi, Arg.Any<CancellationToken>());
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

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _handler.Handle(new UpdateCfeoiStatusCommand(id, CfeoiStatus.Open), CancellationToken.None));
        await _repository.DidNotReceive().UpdateAsync(Arg.Any<CfeoiEntity>(), Arg.Any<CancellationToken>());
    }
}
