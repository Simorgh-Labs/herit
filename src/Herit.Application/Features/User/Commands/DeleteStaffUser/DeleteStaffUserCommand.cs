using MediatR;

namespace Herit.Application.Features.User.Commands.DeleteStaffUser;

public record DeleteStaffUserCommand(Guid Id) : IRequest<Unit>;

public class DeleteStaffUserCommandHandler : IRequestHandler<DeleteStaffUserCommand, Unit>
{
    public Task<Unit> Handle(DeleteStaffUserCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
