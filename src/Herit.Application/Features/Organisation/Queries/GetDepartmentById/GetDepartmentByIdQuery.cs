using MediatR;

namespace Herit.Application.Features.Organisation.Queries.GetDepartmentById;

public record GetDepartmentByIdQuery(Guid Id) : IRequest<Herit.Domain.Entities.Organisation?>;

public class GetDepartmentByIdQueryHandler : IRequestHandler<GetDepartmentByIdQuery, Herit.Domain.Entities.Organisation?>
{
    public Task<Herit.Domain.Entities.Organisation?> Handle(GetDepartmentByIdQuery request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
