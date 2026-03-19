using MediatR;

namespace Herit.Application.Features.Organisation.Queries.ListDepartments;

public record ListDepartmentsQuery() : IRequest<IEnumerable<Herit.Domain.Entities.Organisation>>;

public class ListDepartmentsQueryHandler : IRequestHandler<ListDepartmentsQuery, IEnumerable<Herit.Domain.Entities.Organisation>>
{
    public Task<IEnumerable<Herit.Domain.Entities.Organisation>> Handle(ListDepartmentsQuery request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
