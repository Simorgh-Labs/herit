using MediatR;

namespace Herit.Application.Features.Cfeoi.Queries.ListCfeoisByProposal;

public record ListCfeoisByProposalQuery(Guid ProposalId) : IRequest<IEnumerable<Herit.Domain.Entities.Cfeoi>>;

public class ListCfeoisByProposalQueryHandler : IRequestHandler<ListCfeoisByProposalQuery, IEnumerable<Herit.Domain.Entities.Cfeoi>>
{
    public Task<IEnumerable<Herit.Domain.Entities.Cfeoi>> Handle(ListCfeoisByProposalQuery request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
