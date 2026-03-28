using Herit.Application.Features.Rfp.Commands.UpdateRfpStatus;
using Herit.Domain.Enums;

namespace Herit.Application.Tests.Features.Rfp.Commands;

public class UpdateRfpStatusCommandHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new UpdateRfpStatusCommandHandler();
        var command = new UpdateRfpStatusCommand(Guid.NewGuid(), RfpStatus.Approved);
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(command, CancellationToken.None));
    }
}
