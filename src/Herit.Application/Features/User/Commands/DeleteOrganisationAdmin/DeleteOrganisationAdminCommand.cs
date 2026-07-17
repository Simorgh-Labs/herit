using Herit.Application.Exceptions;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using MediatR;

namespace Herit.Application.Features.User.Commands.DeleteOrganisationAdmin;

public record DeleteOrganisationAdminCommand(Guid Id) : IRequest<Unit>;

public class DeleteOrganisationAdminCommandHandler : IRequestHandler<DeleteOrganisationAdminCommand, Unit>
{
    private readonly IUserRepository _userRepository;
    private readonly IIdentityProviderService _identityProviderService;
    private readonly ICurrentUserService _currentUserService;

    public DeleteOrganisationAdminCommandHandler(
        IUserRepository userRepository,
        IIdentityProviderService identityProviderService,
        ICurrentUserService currentUserService)
    {
        _userRepository = userRepository;
        _identityProviderService = identityProviderService;
        _currentUserService = currentUserService;
    }

    public async Task<Unit> Handle(DeleteOrganisationAdminCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.Id, cancellationToken);
        if (user is null)
            throw new NotFoundException($"User with ID '{request.Id}' was not found.");

        if (user.Role != UserRole.OrganisationAdmin)
            throw new InvalidOperationException($"User with ID '{request.Id}' is not an OrganisationAdmin.");

        var currentUser = await _currentUserService.GetCurrentUserAsync(cancellationToken);
        if (currentUser.Id == request.Id)
            throw new ForbiddenException("You cannot delete your own account.");

        var allUsers = await _userRepository.ListAsync(cancellationToken);
        var remainingAdminCount = allUsers.Count(u => u.Role == UserRole.OrganisationAdmin);
        if (remainingAdminCount <= 1)
            throw new ConflictException("The last remaining OrganisationAdmin cannot be deleted.");

        await _identityProviderService.DeleteUserAsync(user.ExternalId, cancellationToken);
        await _userRepository.DeleteAsync(request.Id, cancellationToken);

        return Unit.Value;
    }
}
