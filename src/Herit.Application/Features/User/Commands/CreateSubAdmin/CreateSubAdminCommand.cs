using MediatR;

namespace Herit.Application.Features.User.Commands.CreateSubAdmin;

public record CreateSubAdminCommand(string Email, string FullName, Guid OrganisationId) : IRequest<Guid>;

public class CreateSubAdminCommandHandler : IRequestHandler<CreateSubAdminCommand, Guid>
{
    public Task<Guid> Handle(CreateSubAdminCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
