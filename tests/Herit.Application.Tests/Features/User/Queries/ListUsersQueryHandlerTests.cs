using Herit.Application.Features.User.Queries.ListUsers;

namespace Herit.Application.Tests.Features.User.Queries;

public class ListUsersQueryHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new ListUsersQueryHandler();
        var query = new ListUsersQuery();
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(query, CancellationToken.None));
    }
}
