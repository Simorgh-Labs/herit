using Herit.Application.Features.Cfeoi.Commands.CloseCfeoi;

namespace Herit.Application.Tests.Features.Cfeoi.Commands;

public class CloseCfeoiCommandHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new CloseCfeoiCommandHandler();
        var command = new CloseCfeoiCommand(Guid.NewGuid());
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(command, CancellationToken.None));
    }
}
