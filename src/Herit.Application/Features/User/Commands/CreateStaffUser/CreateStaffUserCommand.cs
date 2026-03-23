using MediatR;

namespace Herit.Application.Features.User.Commands.CreateStaffUser;

public record CreateStaffUserCommand(string Email, string FullName, Guid OrganisationId) : IRequest<Guid>;

public class CreateStaffUserCommandHandler : IRequestHandler<CreateStaffUserCommand, Guid>
{
    public Task<Guid> Handle(CreateStaffUserCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
