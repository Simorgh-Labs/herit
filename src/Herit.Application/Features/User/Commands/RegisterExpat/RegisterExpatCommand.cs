using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using MediatR;
using UserEntity = Herit.Domain.Entities.User;

namespace Herit.Application.Features.User.Commands.RegisterExpat;

public record RegisterExpatCommand(string Email, string FullName) : IRequest<Guid>;

public class RegisterExpatCommandHandler : IRequestHandler<RegisterExpatCommand, Guid>
{
    private readonly IUserRepository _userRepository;

    public RegisterExpatCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<Guid> Handle(RegisterExpatCommand request, CancellationToken cancellationToken)
    {
        var user = UserEntity.Create(Guid.NewGuid(), request.Email, request.FullName, UserRole.Expat);

        await _userRepository.AddAsync(user, cancellationToken);

        return user.Id;
    }
}
