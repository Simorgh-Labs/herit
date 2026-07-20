using Herit.Application.Exceptions;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using MediatR;
using Microsoft.Extensions.Logging;
using UserEntity = Herit.Domain.Entities.User;

namespace Herit.Application.Features.User.Commands.CreateStaffUser;

public record CreateStaffUserCommand(string Email, string FullName, Guid OrganisationId) : IRequest<Guid>;

public class CreateStaffUserCommandHandler : IRequestHandler<CreateStaffUserCommand, Guid>
{
    private readonly IUserRepository _userRepository;
    private readonly IOrganisationRepository _organisationRepository;
    private readonly IIdentityProviderService _identityProviderService;
    private readonly IEmailService _emailService;
    private readonly ILogger<CreateStaffUserCommandHandler> _logger;

    public CreateStaffUserCommandHandler(
        IUserRepository userRepository,
        IOrganisationRepository organisationRepository,
        IIdentityProviderService identityProviderService,
        IEmailService emailService,
        ILogger<CreateStaffUserCommandHandler> logger)
    {
        _userRepository = userRepository;
        _organisationRepository = organisationRepository;
        _identityProviderService = identityProviderService;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<Guid> Handle(CreateStaffUserCommand request, CancellationToken cancellationToken)
    {
        var organisation = await _organisationRepository.GetByIdAsync(request.OrganisationId, cancellationToken);
        if (organisation is null)
            throw new NotFoundException($"Organisation with ID '{request.OrganisationId}' was not found.");

        var externalId = await _identityProviderService.CreateUserAsync(request.Email, request.FullName, cancellationToken);

        var user = UserEntity.Create(Guid.NewGuid(), externalId, request.Email, request.FullName, UserRole.Staff, request.OrganisationId);

        await _userRepository.AddAsync(user, cancellationToken);

        try
        {
            await _emailService.SendInternalUserInvitationAsync(request.Email, request.FullName, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(
                ex,
                "Failed to send invitation email to {Email}. The account was created successfully; manually notify the user or re-trigger the invitation email.",
                request.Email);
        }

        return user.Id;
    }
}
