using Herit.Application.Features.Proposal.Commands.SetProposalVisibility;
using Herit.Domain.Enums;

namespace Herit.Application.Tests.Features.Proposal.Commands;

public class SetProposalVisibilityCommandHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new SetProposalVisibilityCommandHandler();
        var command = new SetProposalVisibilityCommand(Guid.NewGuid(), ProposalVisibility.Public);
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(command, CancellationToken.None));
    }
}
