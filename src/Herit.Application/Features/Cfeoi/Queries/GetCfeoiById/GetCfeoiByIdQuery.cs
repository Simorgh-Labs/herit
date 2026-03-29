using Herit.Application.Interfaces;
using MediatR;

namespace Herit.Application.Features.Cfeoi.Queries.GetCfeoiById;

public record GetCfeoiByIdQuery(Guid Id) : IRequest<Herit.Domain.Entities.Cfeoi?>;

public class GetCfeoiByIdQueryHandler : IRequestHandler<GetCfeoiByIdQuery, Herit.Domain.Entities.Cfeoi?>
{
    private readonly ICfeoiRepository _cfeoiRepository;

    public GetCfeoiByIdQueryHandler(ICfeoiRepository cfeoiRepository)
    {
        _cfeoiRepository = cfeoiRepository;
    }

    public Task<Herit.Domain.Entities.Cfeoi?> Handle(GetCfeoiByIdQuery request, CancellationToken cancellationToken)
        => _cfeoiRepository.GetByIdAsync(request.Id, cancellationToken);
}
