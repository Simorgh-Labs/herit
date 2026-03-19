using MediatR;

namespace Herit.Application.Features.Organisation.Commands.CreateDepartment;

public record CreateDepartmentCommand(string Name, Guid? ParentId = null) : IRequest<Guid>;

public class CreateDepartmentCommandHandler : IRequestHandler<CreateDepartmentCommand, Guid>
{
    public Task<Guid> Handle(CreateDepartmentCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
