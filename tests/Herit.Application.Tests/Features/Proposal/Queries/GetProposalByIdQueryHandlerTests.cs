using Herit.Application.Features.Proposal.Queries.GetProposalById;

namespace Herit.Application.Tests.Features.Proposal.Queries;

public class GetProposalByIdQueryHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new GetProposalByIdQueryHandler();
        var query = new GetProposalByIdQuery(Guid.NewGuid());
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(query, CancellationToken.None));
    }
}
