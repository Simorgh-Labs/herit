using Herit.Application.Interfaces;
using MediatR;

namespace Herit.Application.Features.Rfp.Queries.GetRfpById;

public record GetRfpByIdQuery(Guid Id) : IRequest<Herit.Domain.Entities.Rfp?>;

public class GetRfpByIdQueryHandler : IRequestHandler<GetRfpByIdQuery, Herit.Domain.Entities.Rfp?>
{
    private readonly IRfpRepository _repository;

    public GetRfpByIdQueryHandler(IRfpRepository repository)
    {
        _repository = repository;
    }

    public Task<Herit.Domain.Entities.Rfp?> Handle(GetRfpByIdQuery request, CancellationToken cancellationToken)
        => _repository.GetByIdAsync(request.Id, cancellationToken);
}
