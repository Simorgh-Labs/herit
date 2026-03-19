using Herit.Application.Features.Cfeoi.Commands.PublishCfeoi;
using Herit.Domain.Enums;

namespace Herit.Application.Tests.Features.Cfeoi.Commands;

public class PublishCfeoiCommandHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new PublishCfeoiCommandHandler();
        var command = new PublishCfeoiCommand("Title", "Desc", CfeoiResourceType.Human, Guid.NewGuid());
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(command, CancellationToken.None));
    }
}
