using Herit.Application.Interfaces;
using MediatR;

namespace Herit.Application.Features.User.Commands.UpdateStaffUser;

public record UpdateStaffUserCommand(Guid Id, string Email, string FullName) : IRequest<Unit>;

public class UpdateStaffUserCommandHandler : IRequestHandler<UpdateStaffUserCommand, Unit>
{
    private readonly IUserRepository _userRepository;

    public UpdateStaffUserCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<Unit> Handle(UpdateStaffUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.Id, cancellationToken);
        if (user is null)
            throw new InvalidOperationException($"User with ID '{request.Id}' was not found.");

        user.Update(request.Email, request.FullName);

        await _userRepository.UpdateAsync(user, cancellationToken);

        return Unit.Value;
    }
}
