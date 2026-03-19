using Herit.Application.Features.Eoi.Queries.GetEoiById;

namespace Herit.Application.Tests.Features.Eoi.Queries;

public class GetEoiByIdQueryHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new GetEoiByIdQueryHandler();
        var query = new GetEoiByIdQuery(Guid.NewGuid());
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(query, CancellationToken.None));
    }
}
