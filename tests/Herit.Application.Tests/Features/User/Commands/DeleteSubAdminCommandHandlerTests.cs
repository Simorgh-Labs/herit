using Herit.Application.Features.User.Commands.DeleteSubAdmin;

namespace Herit.Application.Tests.Features.User.Commands;

public class DeleteSubAdminCommandHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new DeleteSubAdminCommandHandler();
        var command = new DeleteSubAdminCommand(Guid.NewGuid());
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(command, CancellationToken.None));
    }
}
