using Herit.Application.Exceptions;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using MediatR;

namespace Herit.Application.Features.User.Commands.DeleteOrganisationAdmin;

public record DeleteOrganisationAdminCommand(Guid Id) : IRequest<Unit>;

public class DeleteOrganisationAdminCommandHandler : IRequestHandler<DeleteOrganisationAdminCommand, Unit>
{
    private readonly IUserRepository _userRepository;

    public DeleteOrganisationAdminCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<Unit> Handle(DeleteOrganisationAdminCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.Id, cancellationToken);
        if (user is null)
            throw new NotFoundException($"User with ID '{request.Id}' was not found.");

        if (user.Role != UserRole.OrganisationAdmin)
            throw new InvalidOperationException($"User with ID '{request.Id}' is not an OrganisationAdmin.");

        await _userRepository.DeleteAsync(request.Id, cancellationToken);

        return Unit.Value;
    }
}
