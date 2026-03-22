using Herit.Application.Features.Eoi.Queries.ListEoisByCfeoi;

namespace Herit.Application.Tests.Features.Eoi.Queries;

public class ListEoisByCfeoiQueryHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new ListEoisByCfeoiQueryHandler();
        var query = new ListEoisByCfeoiQuery(Guid.NewGuid());
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(query, CancellationToken.None));
    }
}
