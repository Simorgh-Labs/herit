using MediatR;

namespace Herit.Application.Features.User.Queries.ListUsers;

public record ListUsersQuery() : IRequest<IEnumerable<Herit.Domain.Entities.User>>;

public class ListUsersQueryHandler : IRequestHandler<ListUsersQuery, IEnumerable<Herit.Domain.Entities.User>>
{
    public Task<IEnumerable<Herit.Domain.Entities.User>> Handle(ListUsersQuery request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
