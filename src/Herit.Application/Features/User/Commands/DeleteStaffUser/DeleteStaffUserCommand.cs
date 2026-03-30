using Herit.Application.Exceptions;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using MediatR;

namespace Herit.Application.Features.User.Commands.DeleteStaffUser;

public record DeleteStaffUserCommand(Guid Id) : IRequest<Unit>;

public class DeleteStaffUserCommandHandler : IRequestHandler<DeleteStaffUserCommand, Unit>
{
    private readonly IUserRepository _userRepository;

    public DeleteStaffUserCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<Unit> Handle(DeleteStaffUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.Id, cancellationToken);
        if (user is null)
            throw new NotFoundException($"User with ID '{request.Id}' was not found.");

        if (user.Role != UserRole.Staff)
            throw new InvalidOperationException($"User with ID '{request.Id}' is not a Staff user.");

        await _userRepository.DeleteAsync(request.Id, cancellationToken);

        return Unit.Value;
    }
}
