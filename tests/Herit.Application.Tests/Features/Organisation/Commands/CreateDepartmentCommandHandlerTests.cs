using Herit.Application.Features.Organisation.Commands.CreateDepartment;

namespace Herit.Application.Tests.Features.Organisation.Commands;

public class CreateDepartmentCommandHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new CreateDepartmentCommandHandler();
        var command = new CreateDepartmentCommand("Ministry of Finance");
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(command, CancellationToken.None));
    }
}
