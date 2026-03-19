using Herit.Application.Features.Cfeoi.Queries.ListCfeoisByProposal;

namespace Herit.Application.Tests.Features.Cfeoi.Queries;

public class ListCfeoisByProposalQueryHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new ListCfeoisByProposalQueryHandler();
        var query = new ListCfeoisByProposalQuery(Guid.NewGuid());
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(query, CancellationToken.None));
    }
}
