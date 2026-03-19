using Herit.Application.Features.Proposal.Commands.WithdrawProposal;

namespace Herit.Application.Tests.Features.Proposal.Commands;

public class WithdrawProposalCommandHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new WithdrawProposalCommandHandler();
        var command = new WithdrawProposalCommand(Guid.NewGuid());
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(command, CancellationToken.None));
    }
}
