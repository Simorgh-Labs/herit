using Herit.Application.Interfaces;
using MediatR;

namespace Herit.Application.Features.Proposal.Queries.GetProposalById;

public record GetProposalByIdQuery(Guid Id) : IRequest<Herit.Domain.Entities.Proposal?>;

public class GetProposalByIdQueryHandler : IRequestHandler<GetProposalByIdQuery, Herit.Domain.Entities.Proposal?>
{
    private readonly IProposalRepository _proposalRepository;

    public GetProposalByIdQueryHandler(IProposalRepository proposalRepository)
    {
        _proposalRepository = proposalRepository;
    }

    public Task<Herit.Domain.Entities.Proposal?> Handle(GetProposalByIdQuery request, CancellationToken cancellationToken)
        => _proposalRepository.GetByIdAsync(request.Id, cancellationToken);
}
