using Herit.Application.Features.User.Commands.CreateSubAdmin;

namespace Herit.Application.Tests.Features.User.Commands;

public class CreateSubAdminCommandHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new CreateSubAdminCommandHandler();
        var command = new CreateSubAdminCommand("admin@gov.eg", "Sub Admin", Guid.NewGuid());
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(command, CancellationToken.None));
    }
}
