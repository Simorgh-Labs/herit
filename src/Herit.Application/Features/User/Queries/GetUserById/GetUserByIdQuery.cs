using Herit.Application.Exceptions;
using Herit.Application.Interfaces;
using MediatR;

namespace Herit.Application.Features.User.Queries.GetUserById;

public record GetUserByIdQuery(Guid Id) : IRequest<Herit.Domain.Entities.User>;

public class GetUserByIdQueryHandler : IRequestHandler<GetUserByIdQuery, Herit.Domain.Entities.User>
{
    private readonly IUserRepository _userRepository;

    public GetUserByIdQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<Herit.Domain.Entities.User> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.Id, cancellationToken);
        if (user is null)
            throw new NotFoundException($"User '{request.Id}' was not found.");
        return user;
    }
}
