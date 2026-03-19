using Herit.Application.Features.Proposal.Commands.ApproveProposal;

namespace Herit.Application.Tests.Features.Proposal.Commands;

public class ApproveProposalCommandHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new ApproveProposalCommandHandler();
        var command = new ApproveProposalCommand(Guid.NewGuid());
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(command, CancellationToken.None));
    }
}
