using Herit.Application.Features.User.Commands.CreateStaffUser;

namespace Herit.Application.Tests.Features.User.Commands;

public class CreateStaffUserCommandHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new CreateStaffUserCommandHandler();
        var command = new CreateStaffUserCommand("staff@gov.eg", "Staff Member", Guid.NewGuid());
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(command, CancellationToken.None));
    }
}
