using Azure;
using Azure.Communication.Email;
using Herit.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Herit.Infrastructure.Services;

public class AcsEmailService : IEmailService
{
    private readonly EmailClient _emailClient;
    private readonly string _senderAddress;
    private readonly string _inviteRedirectUrl;

    public AcsEmailService(IConfiguration configuration)
    {
        var connectionString = configuration["Email:AcsConnectionString"]
            ?? throw new InvalidOperationException("Email:AcsConnectionString is not configured.");
        _senderAddress = configuration["Email:SenderAddress"]
            ?? throw new InvalidOperationException("Email:SenderAddress is not configured.");
        _inviteRedirectUrl = configuration["AzureAd:InviteRedirectUrl"]
            ?? throw new InvalidOperationException("AzureAd:InviteRedirectUrl is not configured.");

        _emailClient = new EmailClient(connectionString);
    }

    public async Task SendInternalUserInvitationAsync(string email, string displayName, CancellationToken ct)
    {
        var message = new EmailMessage(
            senderAddress: _senderAddress,
            recipientAddress: email,
            content: new EmailContent(InternalUserInvitationEmail.Subject)
            {
                PlainText = InternalUserInvitationEmail.BuildBody(displayName, _inviteRedirectUrl),
            });

        await _emailClient.SendAsync(WaitUntil.Completed, message, ct);
    }
}
