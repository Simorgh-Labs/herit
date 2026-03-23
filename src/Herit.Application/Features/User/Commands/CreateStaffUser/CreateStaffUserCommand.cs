using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using MediatR;
using UserEntity = Herit.Domain.Entities.User;

namespace Herit.Application.Features.User.Commands.CreateStaffUser;

public record CreateStaffUserCommand(string Email, string FullName, Guid OrganisationId) : IRequest<Guid>;

public class CreateStaffUserCommandHandler : IRequestHandler<CreateStaffUserCommand, Guid>
{
    private readonly IUserRepository _userRepository;
    private readonly IOrganisationRepository _organisationRepository;

    public CreateStaffUserCommandHandler(IUserRepository userRepository, IOrganisationRepository organisationRepository)
    {
        _userRepository = userRepository;
        _organisationRepository = organisationRepository;
    }

    public async Task<Guid> Handle(CreateStaffUserCommand request, CancellationToken cancellationToken)
    {
        var organisation = await _organisationRepository.GetByIdAsync(request.OrganisationId, cancellationToken);
        if (organisation is null)
            throw new InvalidOperationException($"Organisation with ID '{request.OrganisationId}' was not found.");

        var user = UserEntity.Create(Guid.NewGuid(), request.Email, request.FullName, UserRole.Staff, request.OrganisationId);

        await _userRepository.AddAsync(user, cancellationToken);

        return user.Id;
    }
}
