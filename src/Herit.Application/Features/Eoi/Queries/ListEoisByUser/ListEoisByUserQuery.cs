using Herit.Application.Interfaces;
using MediatR;

namespace Herit.Application.Features.Eoi.Queries.ListEoisByUser;

public record ListEoisByUserQuery(Guid UserId) : IRequest<IEnumerable<Herit.Domain.Entities.Eoi>>;

public class ListEoisByUserQueryHandler : IRequestHandler<ListEoisByUserQuery, IEnumerable<Herit.Domain.Entities.Eoi>>
{
    private readonly IEoiRepository _eoiRepository;

    public ListEoisByUserQueryHandler(IEoiRepository eoiRepository)
    {
        _eoiRepository = eoiRepository;
    }

    public Task<IEnumerable<Herit.Domain.Entities.Eoi>> Handle(ListEoisByUserQuery request, CancellationToken cancellationToken)
        => _eoiRepository.ListByUserAsync(request.UserId, cancellationToken);
}
