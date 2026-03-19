using Herit.Application.Features.Rfp.Commands.DeleteRfp;

namespace Herit.Application.Tests.Features.Rfp.Commands;

public class DeleteRfpCommandHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new DeleteRfpCommandHandler();
        var command = new DeleteRfpCommand(Guid.NewGuid());
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(command, CancellationToken.None));
    }
}
