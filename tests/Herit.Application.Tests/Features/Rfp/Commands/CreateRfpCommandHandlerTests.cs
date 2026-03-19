using Herit.Application.Features.Rfp.Commands.CreateRfp;

namespace Herit.Application.Tests.Features.Rfp.Commands;

public class CreateRfpCommandHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new CreateRfpCommandHandler();
        var command = new CreateRfpCommand("Title", "Short", Guid.NewGuid(), Guid.NewGuid(), "Long");
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(command, CancellationToken.None));
    }
}
