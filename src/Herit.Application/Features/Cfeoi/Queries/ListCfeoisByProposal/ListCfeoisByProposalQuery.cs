using Herit.Application.Interfaces;
using MediatR;

namespace Herit.Application.Features.Cfeoi.Queries.ListCfeoisByProposal;

public record ListCfeoisByProposalQuery(Guid ProposalId) : IRequest<IEnumerable<Herit.Domain.Entities.Cfeoi>>;

public class ListCfeoisByProposalQueryHandler : IRequestHandler<ListCfeoisByProposalQuery, IEnumerable<Herit.Domain.Entities.Cfeoi>>
{
    private readonly ICfeoiRepository _cfeoiRepository;

    public ListCfeoisByProposalQueryHandler(ICfeoiRepository cfeoiRepository)
    {
        _cfeoiRepository = cfeoiRepository;
    }

    public Task<IEnumerable<Herit.Domain.Entities.Cfeoi>> Handle(ListCfeoisByProposalQuery request, CancellationToken cancellationToken)
        => _cfeoiRepository.ListByProposalAsync(request.ProposalId, cancellationToken);
}
