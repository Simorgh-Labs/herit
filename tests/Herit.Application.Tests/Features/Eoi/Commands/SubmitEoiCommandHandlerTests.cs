using Herit.Application.Features.Eoi.Commands.SubmitEoi;

namespace Herit.Application.Tests.Features.Eoi.Commands;

public class SubmitEoiCommandHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new SubmitEoiCommandHandler();
        var command = new SubmitEoiCommand(Guid.NewGuid(), "Message", Guid.NewGuid());
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(command, CancellationToken.None));
    }
}
