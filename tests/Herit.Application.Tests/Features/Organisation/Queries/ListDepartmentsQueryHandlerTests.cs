using Herit.Application.Features.Organisation.Queries.ListDepartments;

namespace Herit.Application.Tests.Features.Organisation.Queries;

public class ListDepartmentsQueryHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new ListDepartmentsQueryHandler();
        var query = new ListDepartmentsQuery();
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(query, CancellationToken.None));
    }
}
