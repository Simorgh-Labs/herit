using Herit.Application.Exceptions;
using Herit.Application.Interfaces;
using MediatR;

namespace Herit.Application.Features.Eoi.Queries.GetEoiById;

public record GetEoiByIdQuery(Guid Id) : IRequest<Herit.Domain.Entities.Eoi>;

public class GetEoiByIdQueryHandler : IRequestHandler<GetEoiByIdQuery, Herit.Domain.Entities.Eoi>
{
    private readonly IEoiRepository _eoiRepository;

    public GetEoiByIdQueryHandler(IEoiRepository eoiRepository)
    {
        _eoiRepository = eoiRepository;
    }

    public async Task<Herit.Domain.Entities.Eoi> Handle(GetEoiByIdQuery request, CancellationToken cancellationToken)
    {
        var eoi = await _eoiRepository.GetByIdAsync(request.Id, cancellationToken);
        if (eoi is null)
            throw new NotFoundException($"Eoi '{request.Id}' was not found.");
        return eoi;
    }
}
