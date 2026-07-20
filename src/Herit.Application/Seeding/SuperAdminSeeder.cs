using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using Microsoft.Extensions.Logging;
using UserEntity = Herit.Domain.Entities.User;

namespace Herit.Application.Seeding;

public class SuperAdminSeeder
{
    private readonly IUserRepository _userRepository;
    private readonly IIdentityProviderService _identityProviderService;
    private readonly IEmailService _emailService;
    private readonly ILogger<SuperAdminSeeder> _logger;

    public SuperAdminSeeder(
        IUserRepository userRepository,
        IIdentityProviderService identityProviderService,
        IEmailService emailService,
        ILogger<SuperAdminSeeder> logger)
    {
        _userRepository = userRepository;
        _identityProviderService = identityProviderService;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task SeedAsync(string email, string displayName, CancellationToken ct = default)
    {
        var users = await _userRepository.ListAsync(ct);
        if (users.Any(u => u.Role == UserRole.SuperAdmin))
        {
            _logger.LogInformation("Super admin already exists. No action taken.");
            return;
        }

        var externalId = await _identityProviderService.CreateUserAsync(email, displayName, ct);
        var user = UserEntity.Create(Guid.NewGuid(), externalId, email, displayName, UserRole.SuperAdmin);
        await _userRepository.AddAsync(user, ct);

        _logger.LogInformation(
            "Super admin created: {Email} (ExternalId: {ExternalId}).",
            email,
            externalId);

        try
        {
            await _emailService.SendInternalUserInvitationAsync(email, displayName, ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(
                ex,
                "Failed to send invitation email to {Email}. The account was created successfully; manually notify the user or re-trigger the invitation email.",
                email);
        }
    }
}
