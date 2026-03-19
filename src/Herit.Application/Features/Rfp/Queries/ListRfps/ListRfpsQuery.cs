using MediatR;

namespace Herit.Application.Features.Rfp.Queries.ListRfps;

public record ListRfpsQuery() : IRequest<IEnumerable<Herit.Domain.Entities.Rfp>>;

public class ListRfpsQueryHandler : IRequestHandler<ListRfpsQuery, IEnumerable<Herit.Domain.Entities.Rfp>>
{
    public Task<IEnumerable<Herit.Domain.Entities.Rfp>> Handle(ListRfpsQuery request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
