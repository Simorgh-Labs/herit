using MediatR;

namespace Herit.Application.Features.Organisation.Commands.DeleteDepartment;

public record DeleteDepartmentCommand(Guid Id) : IRequest<Unit>;

public class DeleteDepartmentCommandHandler : IRequestHandler<DeleteDepartmentCommand, Unit>
{
    public Task<Unit> Handle(DeleteDepartmentCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
