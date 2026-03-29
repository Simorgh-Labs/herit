using Herit.Application.Interfaces;
using MediatR;

namespace Herit.Application.Features.Eoi.Queries.ListEoisByCfeoi;

public record ListEoisByCfeoiQuery(Guid CfeoiId) : IRequest<IEnumerable<Herit.Domain.Entities.Eoi>>;

public class ListEoisByCfeoiQueryHandler : IRequestHandler<ListEoisByCfeoiQuery, IEnumerable<Herit.Domain.Entities.Eoi>>
{
    private readonly IEoiRepository _eoiRepository;

    public ListEoisByCfeoiQueryHandler(IEoiRepository eoiRepository)
    {
        _eoiRepository = eoiRepository;
    }

    public Task<IEnumerable<Herit.Domain.Entities.Eoi>> Handle(ListEoisByCfeoiQuery request, CancellationToken cancellationToken)
        => _eoiRepository.ListByCfeoiAsync(request.CfeoiId, cancellationToken);
}
