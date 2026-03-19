using Herit.Application.Features.User.Queries.GetUserById;

namespace Herit.Application.Tests.Features.User.Queries;

public class GetUserByIdQueryHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new GetUserByIdQueryHandler();
        var query = new GetUserByIdQuery(Guid.NewGuid());
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(query, CancellationToken.None));
    }
}
