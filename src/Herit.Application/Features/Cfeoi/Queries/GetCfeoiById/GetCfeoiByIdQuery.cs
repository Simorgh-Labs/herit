using MediatR;

namespace Herit.Application.Features.Cfeoi.Queries.GetCfeoiById;

public record GetCfeoiByIdQuery(Guid Id) : IRequest<Herit.Domain.Entities.Cfeoi?>;

public class GetCfeoiByIdQueryHandler : IRequestHandler<GetCfeoiByIdQuery, Herit.Domain.Entities.Cfeoi?>
{
    public Task<Herit.Domain.Entities.Cfeoi?> Handle(GetCfeoiByIdQuery request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
