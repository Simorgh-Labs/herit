using MediatR;

namespace Herit.Application.Features.User.Queries.GetUserById;

public record GetUserByIdQuery(Guid Id) : IRequest<Herit.Domain.Entities.User?>;

public class GetUserByIdQueryHandler : IRequestHandler<GetUserByIdQuery, Herit.Domain.Entities.User?>
{
    public Task<Herit.Domain.Entities.User?> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
