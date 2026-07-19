using Azure.Identity;
using Herit.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using Microsoft.Graph.Models;

namespace Herit.Infrastructure.Services;

public class EntraExternalIdIdentityProviderService : IIdentityProviderService
{
    private readonly GraphServiceClient _graphClient;
    private readonly string _inviteRedirectUrl;

    public EntraExternalIdIdentityProviderService(IConfiguration configuration)
    {
        var tenantId = configuration["AzureAd:TenantId"]
            ?? throw new InvalidOperationException("AzureAd:TenantId is not configured.");
        var clientId = configuration["AzureAd:ClientId"]
            ?? throw new InvalidOperationException("AzureAd:ClientId is not configured.");
        var clientSecret = configuration["AzureAd:ClientSecret"]
            ?? throw new InvalidOperationException("AzureAd:ClientSecret is not configured.");
        _inviteRedirectUrl = configuration["AzureAd:InviteRedirectUrl"]
            ?? throw new InvalidOperationException("AzureAd:InviteRedirectUrl is not configured.");

        var credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
        _graphClient = new GraphServiceClient(credential);
    }

    public async Task<string> CreateUserAsync(string email, string displayName, CancellationToken ct)
    {
        var invitation = new Invitation
        {
            InvitedUserEmailAddress = email,
            InvitedUserDisplayName = displayName,
            InviteRedirectUrl = _inviteRedirectUrl,
            SendInvitationMessage = true,
        };

        var created = await _graphClient.Invitations.PostAsync(invitation, cancellationToken: ct)
            ?? throw new InvalidOperationException("Graph API returned null when creating the invitation.");

        return created.InvitedUser?.Id
            ?? throw new InvalidOperationException("Graph API did not return an object ID for the invited user.");
    }

    public async Task DeleteUserAsync(string externalId, CancellationToken ct)
    {
        await _graphClient.Users[externalId].DeleteAsync(cancellationToken: ct);
    }
}
