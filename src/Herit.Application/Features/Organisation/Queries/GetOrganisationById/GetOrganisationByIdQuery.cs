using Herit.Application.Interfaces;
using MediatR;

namespace Herit.Application.Features.Organisation.Queries.GetOrganisationById;

public record GetOrganisationByIdQuery(Guid Id) : IRequest<Herit.Domain.Entities.Organisation?>;

public class GetOrganisationByIdQueryHandler : IRequestHandler<GetOrganisationByIdQuery, Herit.Domain.Entities.Organisation?>
{
    private readonly IOrganisationRepository _repository;

    public GetOrganisationByIdQueryHandler(IOrganisationRepository repository)
    {
        _repository = repository;
    }

    public Task<Herit.Domain.Entities.Organisation?> Handle(GetOrganisationByIdQuery request, CancellationToken cancellationToken)
        => _repository.GetByIdAsync(request.Id, cancellationToken);
}
