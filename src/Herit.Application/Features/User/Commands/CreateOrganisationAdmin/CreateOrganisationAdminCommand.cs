using Herit.Application.Exceptions;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using MediatR;
using UserEntity = Herit.Domain.Entities.User;

namespace Herit.Application.Features.User.Commands.CreateOrganisationAdmin;

public record CreateOrganisationAdminCommand(string Email, string FullName, Guid OrganisationId) : IRequest<Guid>;

public class CreateOrganisationAdminCommandHandler : IRequestHandler<CreateOrganisationAdminCommand, Guid>
{
    private readonly IUserRepository _userRepository;
    private readonly IOrganisationRepository _organisationRepository;
    private readonly IIdentityProviderService _identityProviderService;

    public CreateOrganisationAdminCommandHandler(IUserRepository userRepository, IOrganisationRepository organisationRepository, IIdentityProviderService identityProviderService)
    {
        _userRepository = userRepository;
        _organisationRepository = organisationRepository;
        _identityProviderService = identityProviderService;
    }

    public async Task<Guid> Handle(CreateOrganisationAdminCommand request, CancellationToken cancellationToken)
    {
        var organisation = await _organisationRepository.GetByIdAsync(request.OrganisationId, cancellationToken);
        if (organisation is null)
            throw new NotFoundException($"Organisation with ID '{request.OrganisationId}' was not found.");

        var externalId = await _identityProviderService.CreateUserAsync(request.Email, request.FullName, cancellationToken);

        var user = UserEntity.Create(Guid.NewGuid(), externalId, request.Email, request.FullName, UserRole.OrganisationAdmin, request.OrganisationId);

        await _userRepository.AddAsync(user, cancellationToken);

        return user.Id;
    }
}
