using Herit.Application.Features.Rfp.Queries.GetRfpById;

namespace Herit.Application.Tests.Features.Rfp.Queries;

public class GetRfpByIdQueryHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new GetRfpByIdQueryHandler();
        var query = new GetRfpByIdQuery(Guid.NewGuid());
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(query, CancellationToken.None));
    }
}
