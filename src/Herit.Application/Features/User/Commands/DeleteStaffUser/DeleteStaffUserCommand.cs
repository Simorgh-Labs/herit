using Herit.Application.Exceptions;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using MediatR;

namespace Herit.Application.Features.User.Commands.DeleteStaffUser;

public record DeleteStaffUserCommand(Guid Id) : IRequest<Unit>;

public class DeleteStaffUserCommandHandler : IRequestHandler<DeleteStaffUserCommand, Unit>
{
    private readonly IUserRepository _userRepository;
    private readonly IIdentityProviderService _identityProviderService;
    private readonly ICurrentUserService _currentUserService;

    public DeleteStaffUserCommandHandler(
        IUserRepository userRepository,
        IIdentityProviderService identityProviderService,
        ICurrentUserService currentUserService)
    {
        _userRepository = userRepository;
        _identityProviderService = identityProviderService;
        _currentUserService = currentUserService;
    }

    public async Task<Unit> Handle(DeleteStaffUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.Id, cancellationToken);
        if (user is null)
            throw new NotFoundException($"User with ID '{request.Id}' was not found.");

        if (user.Role != UserRole.Staff)
            throw new InvalidOperationException($"User with ID '{request.Id}' is not a Staff user.");

        var currentUser = await _currentUserService.GetCurrentUserAsync(cancellationToken);
        if (currentUser.Id == request.Id)
            throw new ForbiddenException("You cannot delete your own account.");

        await _identityProviderService.DeleteUserAsync(user.ExternalId, cancellationToken);
        await _userRepository.DeleteAsync(request.Id, cancellationToken);

        return Unit.Value;
    }
}
