using MediatR;

namespace Herit.Application.Features.Rfp.Queries.GetRfpById;

public record GetRfpByIdQuery(Guid Id) : IRequest<Herit.Domain.Entities.Rfp?>;

public class GetRfpByIdQueryHandler : IRequestHandler<GetRfpByIdQuery, Herit.Domain.Entities.Rfp?>
{
    public Task<Herit.Domain.Entities.Rfp?> Handle(GetRfpByIdQuery request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
