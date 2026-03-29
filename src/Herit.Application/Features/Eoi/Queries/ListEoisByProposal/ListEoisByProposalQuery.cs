using Herit.Application.Interfaces;
using MediatR;

namespace Herit.Application.Features.Eoi.Queries.ListEoisByProposal;

public record ListEoisByProposalQuery(Guid ProposalId) : IRequest<IEnumerable<Herit.Domain.Entities.Eoi>>;

public class ListEoisByProposalQueryHandler : IRequestHandler<ListEoisByProposalQuery, IEnumerable<Herit.Domain.Entities.Eoi>>
{
    private readonly IEoiRepository _eoiRepository;

    public ListEoisByProposalQueryHandler(IEoiRepository eoiRepository)
    {
        _eoiRepository = eoiRepository;
    }

    public Task<IEnumerable<Herit.Domain.Entities.Eoi>> Handle(ListEoisByProposalQuery request, CancellationToken cancellationToken)
        => _eoiRepository.ListByProposalAsync(request.ProposalId, cancellationToken);
}
