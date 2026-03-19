using Herit.Application.Features.Proposal.Commands.DeleteProposal;

namespace Herit.Application.Tests.Features.Proposal.Commands;

public class DeleteProposalCommandHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new DeleteProposalCommandHandler();
        var command = new DeleteProposalCommand(Guid.NewGuid());
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(command, CancellationToken.None));
    }
}
