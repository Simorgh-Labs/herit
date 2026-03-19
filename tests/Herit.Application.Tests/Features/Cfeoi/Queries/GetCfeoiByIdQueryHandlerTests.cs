using Herit.Application.Features.Cfeoi.Queries.GetCfeoiById;

namespace Herit.Application.Tests.Features.Cfeoi.Queries;

public class GetCfeoiByIdQueryHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new GetCfeoiByIdQueryHandler();
        var query = new GetCfeoiByIdQuery(Guid.NewGuid());
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(query, CancellationToken.None));
    }
}
