using Herit.Application.Features.Eoi.Commands.RejectEoi;

namespace Herit.Application.Tests.Features.Eoi.Commands;

public class RejectEoiCommandHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new RejectEoiCommandHandler();
        var command = new RejectEoiCommand(Guid.NewGuid());
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(command, CancellationToken.None));
    }
}
