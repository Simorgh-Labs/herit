using MediatR;

namespace Herit.Application.Features.Proposal.Queries.GetProposalById;

public record GetProposalByIdQuery(Guid Id) : IRequest<Herit.Domain.Entities.Proposal?>;

public class GetProposalByIdQueryHandler : IRequestHandler<GetProposalByIdQuery, Herit.Domain.Entities.Proposal?>
{
    public Task<Herit.Domain.Entities.Proposal?> Handle(GetProposalByIdQuery request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
