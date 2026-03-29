using Herit.Application.Interfaces;
using MediatR;

namespace Herit.Application.Features.Eoi.Queries.GetEoiById;

public record GetEoiByIdQuery(Guid Id) : IRequest<Herit.Domain.Entities.Eoi?>;

public class GetEoiByIdQueryHandler : IRequestHandler<GetEoiByIdQuery, Herit.Domain.Entities.Eoi?>
{
    private readonly IEoiRepository _eoiRepository;

    public GetEoiByIdQueryHandler(IEoiRepository eoiRepository)
    {
        _eoiRepository = eoiRepository;
    }

    public Task<Herit.Domain.Entities.Eoi?> Handle(GetEoiByIdQuery request, CancellationToken cancellationToken)
        => _eoiRepository.GetByIdAsync(request.Id, cancellationToken);
}
