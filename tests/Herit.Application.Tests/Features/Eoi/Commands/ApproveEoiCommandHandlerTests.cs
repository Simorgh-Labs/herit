using Herit.Application.Features.Eoi.Commands.ApproveEoi;

namespace Herit.Application.Tests.Features.Eoi.Commands;

public class ApproveEoiCommandHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new ApproveEoiCommandHandler();
        var command = new ApproveEoiCommand(Guid.NewGuid());
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(command, CancellationToken.None));
    }
}
