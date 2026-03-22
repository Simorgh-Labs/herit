using MediatR;

namespace Herit.Application.Features.Eoi.Queries.ListEoisByCfeoi;

public record ListEoisByCfeoiQuery(Guid CfeoiId) : IRequest<IEnumerable<Herit.Domain.Entities.Eoi>>;

public class ListEoisByCfeoiQueryHandler : IRequestHandler<ListEoisByCfeoiQuery, IEnumerable<Herit.Domain.Entities.Eoi>>
{
    public Task<IEnumerable<Herit.Domain.Entities.Eoi>> Handle(ListEoisByCfeoiQuery request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
