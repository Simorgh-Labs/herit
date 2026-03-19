using Herit.Application.Features.Organisation.Commands.UpdateDepartment;

namespace Herit.Application.Tests.Features.Organisation.Commands;

public class UpdateDepartmentCommandHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new UpdateDepartmentCommandHandler();
        var command = new UpdateDepartmentCommand(Guid.NewGuid(), "Updated Name");
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(command, CancellationToken.None));
    }
}
