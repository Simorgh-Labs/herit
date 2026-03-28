using Herit.Application.Interfaces;
using MediatR;

namespace Herit.Application.Features.Proposal.Queries.ListProposals;

public record ListProposalsQuery() : IRequest<IEnumerable<Herit.Domain.Entities.Proposal>>;

public class ListProposalsQueryHandler : IRequestHandler<ListProposalsQuery, IEnumerable<Herit.Domain.Entities.Proposal>>
{
    private readonly IProposalRepository _proposalRepository;

    public ListProposalsQueryHandler(IProposalRepository proposalRepository)
    {
        _proposalRepository = proposalRepository;
    }

    public Task<IEnumerable<Herit.Domain.Entities.Proposal>> Handle(ListProposalsQuery request, CancellationToken cancellationToken)
        => _proposalRepository.ListAsync(cancellationToken);
}
