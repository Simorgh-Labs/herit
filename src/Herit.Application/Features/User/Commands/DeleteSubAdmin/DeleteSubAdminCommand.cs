using MediatR;

namespace Herit.Application.Features.User.Commands.DeleteSubAdmin;

public record DeleteSubAdminCommand(Guid Id) : IRequest<Unit>;

public class DeleteSubAdminCommandHandler : IRequestHandler<DeleteSubAdminCommand, Unit>
{
    public Task<Unit> Handle(DeleteSubAdminCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
