using Herit.Application.Features.Proposal.Commands.ReviewProposal;

namespace Herit.Application.Tests.Features.Proposal.Commands;

public class ReviewProposalCommandHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new ReviewProposalCommandHandler();
        var command = new ReviewProposalCommand(Guid.NewGuid());
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(command, CancellationToken.None));
    }
}
