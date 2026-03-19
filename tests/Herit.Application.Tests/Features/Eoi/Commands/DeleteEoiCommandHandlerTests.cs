using Herit.Application.Features.Eoi.Commands.DeleteEoi;

namespace Herit.Application.Tests.Features.Eoi.Commands;

public class DeleteEoiCommandHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new DeleteEoiCommandHandler();
        var command = new DeleteEoiCommand(Guid.NewGuid());
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(command, CancellationToken.None));
    }
}
