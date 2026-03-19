using Herit.Application.Features.Proposal.Commands.UpdateProposal;

namespace Herit.Application.Tests.Features.Proposal.Commands;

public class UpdateProposalCommandHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new UpdateProposalCommandHandler();
        var command = new UpdateProposalCommand(Guid.NewGuid(), "Title", "Short", "Long");
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(command, CancellationToken.None));
    }
}
