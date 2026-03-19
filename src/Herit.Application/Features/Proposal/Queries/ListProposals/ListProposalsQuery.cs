using MediatR;

namespace Herit.Application.Features.Proposal.Queries.ListProposals;

public record ListProposalsQuery() : IRequest<IEnumerable<Herit.Domain.Entities.Proposal>>;

public class ListProposalsQueryHandler : IRequestHandler<ListProposalsQuery, IEnumerable<Herit.Domain.Entities.Proposal>>
{
    public Task<IEnumerable<Herit.Domain.Entities.Proposal>> Handle(ListProposalsQuery request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
