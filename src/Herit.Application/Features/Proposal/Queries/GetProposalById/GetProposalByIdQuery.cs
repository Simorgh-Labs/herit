using Herit.Application.Exceptions;
using Herit.Application.Interfaces;
using MediatR;

namespace Herit.Application.Features.Proposal.Queries.GetProposalById;

public record GetProposalByIdQuery(Guid Id) : IRequest<Herit.Domain.Entities.Proposal>;

public class GetProposalByIdQueryHandler : IRequestHandler<GetProposalByIdQuery, Herit.Domain.Entities.Proposal>
{
    private readonly IProposalRepository _proposalRepository;

    public GetProposalByIdQueryHandler(IProposalRepository proposalRepository)
    {
        _proposalRepository = proposalRepository;
    }

    public async Task<Herit.Domain.Entities.Proposal> Handle(GetProposalByIdQuery request, CancellationToken cancellationToken)
    {
        var proposal = await _proposalRepository.GetByIdAsync(request.Id, cancellationToken);
        if (proposal is null)
            throw new NotFoundException($"Proposal '{request.Id}' was not found.");
        return proposal;
    }
}
