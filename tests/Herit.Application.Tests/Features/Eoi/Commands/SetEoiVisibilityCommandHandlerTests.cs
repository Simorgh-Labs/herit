using Herit.Application.Features.Eoi.Commands.SetEoiVisibility;
using Herit.Domain.Enums;

namespace Herit.Application.Tests.Features.Eoi.Commands;

public class SetEoiVisibilityCommandHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new SetEoiVisibilityCommandHandler();
        var command = new SetEoiVisibilityCommand(Guid.NewGuid(), EoiVisibility.Shared);
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(command, CancellationToken.None));
    }
}
