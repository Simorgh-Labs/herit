using Herit.Application.Features.Proposal.Commands.CreateProposal;

namespace Herit.Application.Tests.Features.Proposal.Commands;

public class CreateProposalCommandHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new CreateProposalCommandHandler();
        var command = new CreateProposalCommand("Title", "Short", Guid.NewGuid(), Guid.NewGuid(), "Long");
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(command, CancellationToken.None));
    }
}
