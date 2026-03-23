using Herit.Application.Interfaces;
using MediatR;

namespace Herit.Application.Features.User.Queries.ListUsers;

public record ListUsersQuery() : IRequest<IEnumerable<Herit.Domain.Entities.User>>;

public class ListUsersQueryHandler : IRequestHandler<ListUsersQuery, IEnumerable<Herit.Domain.Entities.User>>
{
    private readonly IUserRepository _userRepository;

    public ListUsersQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<Herit.Domain.Entities.User>> Handle(ListUsersQuery request, CancellationToken cancellationToken)
    {
        return await _userRepository.ListAsync(cancellationToken);
    }
}
