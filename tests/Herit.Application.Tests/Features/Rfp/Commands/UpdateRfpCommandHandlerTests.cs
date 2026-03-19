using Herit.Application.Features.Rfp.Commands.UpdateRfp;

namespace Herit.Application.Tests.Features.Rfp.Commands;

public class UpdateRfpCommandHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new UpdateRfpCommandHandler();
        var command = new UpdateRfpCommand(Guid.NewGuid(), "Title", "Short", "Long");
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(command, CancellationToken.None));
    }
}
