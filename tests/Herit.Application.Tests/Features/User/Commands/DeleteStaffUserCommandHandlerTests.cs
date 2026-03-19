using Herit.Application.Features.User.Commands.DeleteStaffUser;

namespace Herit.Application.Tests.Features.User.Commands;

public class DeleteStaffUserCommandHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new DeleteStaffUserCommandHandler();
        var command = new DeleteStaffUserCommand(Guid.NewGuid());
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(command, CancellationToken.None));
    }
}
