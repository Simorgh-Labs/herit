using MediatR;

namespace Herit.Application.Features.Eoi.Queries.ListEoisByProposal;

public record ListEoisByProposalQuery(Guid ProposalId) : IRequest<IEnumerable<Herit.Domain.Entities.Eoi>>;

public class ListEoisByProposalQueryHandler : IRequestHandler<ListEoisByProposalQuery, IEnumerable<Herit.Domain.Entities.Eoi>>
{
    public Task<IEnumerable<Herit.Domain.Entities.Eoi>> Handle(ListEoisByProposalQuery request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
