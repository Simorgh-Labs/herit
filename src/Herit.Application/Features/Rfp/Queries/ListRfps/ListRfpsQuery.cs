using Herit.Application.Interfaces;
using MediatR;

namespace Herit.Application.Features.Rfp.Queries.ListRfps;

public record ListRfpsQuery() : IRequest<IEnumerable<Herit.Domain.Entities.Rfp>>;

public class ListRfpsQueryHandler : IRequestHandler<ListRfpsQuery, IEnumerable<Herit.Domain.Entities.Rfp>>
{
    private readonly IRfpRepository _repository;

    public ListRfpsQueryHandler(IRfpRepository repository)
    {
        _repository = repository;
    }

    public Task<IEnumerable<Herit.Domain.Entities.Rfp>> Handle(ListRfpsQuery request, CancellationToken cancellationToken)
        => _repository.ListAsync(cancellationToken);
}
