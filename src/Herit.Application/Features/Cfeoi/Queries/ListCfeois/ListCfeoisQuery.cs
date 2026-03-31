using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using MediatR;

namespace Herit.Application.Features.Cfeoi.Queries.ListCfeois;

public record ListCfeoisQuery(CfeoiStatus? Status = null, Guid? ProposalId = null) : IRequest<IEnumerable<Herit.Domain.Entities.Cfeoi>>;

public class ListCfeoisQueryHandler : IRequestHandler<ListCfeoisQuery, IEnumerable<Herit.Domain.Entities.Cfeoi>>
{
    private readonly ICfeoiRepository _cfeoiRepository;

    public ListCfeoisQueryHandler(ICfeoiRepository cfeoiRepository)
    {
        _cfeoiRepository = cfeoiRepository;
    }

    public Task<IEnumerable<Herit.Domain.Entities.Cfeoi>> Handle(ListCfeoisQuery request, CancellationToken cancellationToken)
        => _cfeoiRepository.ListAsync(request.Status, request.ProposalId, cancellationToken);
}
