using Herit.Application.Features.Organisation.Commands.DeleteDepartment;

namespace Herit.Application.Tests.Features.Organisation.Commands;

public class DeleteDepartmentCommandHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new DeleteDepartmentCommandHandler();
        var command = new DeleteDepartmentCommand(Guid.NewGuid());
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(command, CancellationToken.None));
    }
}
