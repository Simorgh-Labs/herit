using Herit.Application.Features.Rfp.Queries.ListRfps;

namespace Herit.Application.Tests.Features.Rfp.Queries;

public class ListRfpsQueryHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new ListRfpsQueryHandler();
        var query = new ListRfpsQuery();
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(query, CancellationToken.None));
    }
}
