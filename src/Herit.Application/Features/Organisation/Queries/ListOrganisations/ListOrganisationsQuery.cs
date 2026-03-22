using Herit.Application.Interfaces;
using MediatR;

namespace Herit.Application.Features.Organisation.Queries.ListOrganisations;

public record ListOrganisationsQuery() : IRequest<IEnumerable<Herit.Domain.Entities.Organisation>>;

public class ListOrganisationsQueryHandler : IRequestHandler<ListOrganisationsQuery, IEnumerable<Herit.Domain.Entities.Organisation>>
{
    private readonly IOrganisationRepository _repository;

    public ListOrganisationsQueryHandler(IOrganisationRepository repository)
    {
        _repository = repository;
    }

    public Task<IEnumerable<Herit.Domain.Entities.Organisation>> Handle(ListOrganisationsQuery request, CancellationToken cancellationToken)
        => _repository.ListAsync(cancellationToken);
}
