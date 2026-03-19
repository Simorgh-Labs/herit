using Herit.Application.Features.Eoi.Queries.ListEoisByProposal;

namespace Herit.Application.Tests.Features.Eoi.Queries;

public class ListEoisByProposalQueryHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new ListEoisByProposalQueryHandler();
        var query = new ListEoisByProposalQuery(Guid.NewGuid());
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(query, CancellationToken.None));
    }
}
