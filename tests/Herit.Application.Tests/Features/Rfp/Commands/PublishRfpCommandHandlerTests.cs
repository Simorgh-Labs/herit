using Herit.Application.Features.Rfp.Commands.PublishRfp;

namespace Herit.Application.Tests.Features.Rfp.Commands;

public class PublishRfpCommandHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new PublishRfpCommandHandler();
        var command = new PublishRfpCommand(Guid.NewGuid());
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(command, CancellationToken.None));
    }
}
