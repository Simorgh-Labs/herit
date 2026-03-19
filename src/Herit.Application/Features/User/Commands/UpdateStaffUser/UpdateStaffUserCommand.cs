using MediatR;

namespace Herit.Application.Features.User.Commands.UpdateStaffUser;

public record UpdateStaffUserCommand(Guid Id, string Email, string FullName) : IRequest<Unit>;

public class UpdateStaffUserCommandHandler : IRequestHandler<UpdateStaffUserCommand, Unit>
{
    public Task<Unit> Handle(UpdateStaffUserCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
