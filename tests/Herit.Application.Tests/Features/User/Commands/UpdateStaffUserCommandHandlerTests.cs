using Herit.Application.Features.User.Commands.UpdateStaffUser;

namespace Herit.Application.Tests.Features.User.Commands;

public class UpdateStaffUserCommandHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new UpdateStaffUserCommandHandler();
        var command = new UpdateStaffUserCommand(Guid.NewGuid(), "updated@gov.eg", "Updated Name");
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(command, CancellationToken.None));
    }
}
