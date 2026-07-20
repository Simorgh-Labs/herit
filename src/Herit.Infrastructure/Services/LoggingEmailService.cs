using Herit.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Herit.Infrastructure.Services;

/// <summary>
/// Logs the full email instead of sending it. Registered when no ACS connection string is
/// configured (the Development default).
/// </summary>
public class LoggingEmailService : IEmailService
{
    private readonly string _inviteRedirectUrl;
    private readonly ILogger<LoggingEmailService> _logger;

    public LoggingEmailService(IConfiguration configuration, ILogger<LoggingEmailService> logger)
    {
        _inviteRedirectUrl = configuration["AzureAd:InviteRedirectUrl"]
            ?? throw new InvalidOperationException("AzureAd:InviteRedirectUrl is not configured.");
        _logger = logger;
    }

    public Task SendInternalUserInvitationAsync(string email, string displayName, CancellationToken ct)
    {
        var body = InternalUserInvitationEmail.BuildBody(displayName, _inviteRedirectUrl);

        _logger.LogInformation(
            "Email not sent (no ACS connection string configured). To: {Email}, Subject: {Subject}\n{Body}",
            email,
            InternalUserInvitationEmail.Subject,
            body);

        return Task.CompletedTask;
    }
}
