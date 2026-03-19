using MediatR;

namespace Herit.Application.Features.Organisation.Commands.UpdateDepartment;

public record UpdateDepartmentCommand(Guid Id, string Name) : IRequest<Unit>;

public class UpdateDepartmentCommandHandler : IRequestHandler<UpdateDepartmentCommand, Unit>
{
    public Task<Unit> Handle(UpdateDepartmentCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
