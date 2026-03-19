using Herit.Application.Features.Eoi.Commands.WithdrawEoi;

namespace Herit.Application.Tests.Features.Eoi.Commands;

public class WithdrawEoiCommandHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new WithdrawEoiCommandHandler();
        var command = new WithdrawEoiCommand(Guid.NewGuid());
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(command, CancellationToken.None));
    }
}
