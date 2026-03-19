using Herit.Application.Features.Proposal.Commands.SubmitProposal;

namespace Herit.Application.Tests.Features.Proposal.Commands;

public class SubmitProposalCommandHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new SubmitProposalCommandHandler();
        var command = new SubmitProposalCommand(Guid.NewGuid());
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(command, CancellationToken.None));
    }
}
