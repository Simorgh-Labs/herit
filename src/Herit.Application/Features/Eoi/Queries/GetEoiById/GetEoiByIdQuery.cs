using MediatR;

namespace Herit.Application.Features.Eoi.Queries.GetEoiById;

public record GetEoiByIdQuery(Guid Id) : IRequest<Herit.Domain.Entities.Eoi?>;

public class GetEoiByIdQueryHandler : IRequestHandler<GetEoiByIdQuery, Herit.Domain.Entities.Eoi?>
{
    public Task<Herit.Domain.Entities.Eoi?> Handle(GetEoiByIdQuery request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
