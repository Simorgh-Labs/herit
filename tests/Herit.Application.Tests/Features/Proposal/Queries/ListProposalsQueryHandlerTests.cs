using Herit.Application.Features.Proposal.Queries.ListProposals;

namespace Herit.Application.Tests.Features.Proposal.Queries;

public class ListProposalsQueryHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new ListProposalsQueryHandler();
        var query = new ListProposalsQuery();
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(query, CancellationToken.None));
    }
}
