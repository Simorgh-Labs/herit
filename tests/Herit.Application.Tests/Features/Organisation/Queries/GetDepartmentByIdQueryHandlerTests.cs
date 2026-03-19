using Herit.Application.Features.Organisation.Queries.GetDepartmentById;

namespace Herit.Application.Tests.Features.Organisation.Queries;

public class GetDepartmentByIdQueryHandlerTests
{
    [Fact]
    public async Task Handle_ThrowsNotImplementedException()
    {
        var handler = new GetDepartmentByIdQueryHandler();
        var query = new GetDepartmentByIdQuery(Guid.NewGuid());
        await Assert.ThrowsAsync<NotImplementedException>(() => handler.Handle(query, CancellationToken.None));
    }
}
