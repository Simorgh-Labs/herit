using Azure.Identity;
using Herit.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using Microsoft.Graph.Models;

namespace Herit.Infrastructure.Services;

public class EntraExternalIdIdentityProviderService : IIdentityProviderService
{
    private readonly GraphServiceClient _graphClient;
    private readonly string _entraTenant;

    public EntraExternalIdIdentityProviderService(IConfiguration configuration)
    {
        var tenantId = configuration["AzureAd:TenantId"]
            ?? throw new InvalidOperationException("AzureAd:TenantId is not configured.");
        var clientId = configuration["AzureAd:ClientId"]
            ?? throw new InvalidOperationException("AzureAd:ClientId is not configured.");
        var clientSecret = configuration["AzureAd:ClientSecret"]
            ?? throw new InvalidOperationException("AzureAd:ClientSecret is not configured.");
        _entraTenant = configuration["AzureAd:Domain"]
            ?? throw new InvalidOperationException("AzureAd:Domain is not configured.");

        var credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
        _graphClient = new GraphServiceClient(credential);
    }

    public async Task<string> CreateUserAsync(string email, string displayName, CancellationToken ct)
    {
        var user = new User
        {
            AccountEnabled = true,
            DisplayName = displayName,
            Identities =
            [
                new ObjectIdentity
                {
                    SignInType = "emailAddress",
                    Issuer = _entraTenant,
                    IssuerAssignedId = email,
                }
            ],
            PasswordProfile = new PasswordProfile
            {
                ForceChangePasswordNextSignIn = true,
                Password = Guid.NewGuid().ToString("N") + "Aa1!",
            },
            PasswordPolicies = "DisablePasswordExpiration",
        };

        var created = await _graphClient.Users.PostAsync(user, cancellationToken: ct)
            ?? throw new InvalidOperationException("Graph API returned null when creating user.");

        return created.Id
            ?? throw new InvalidOperationException("Graph API did not return an object ID for the created user.");
    }

    public async Task DeleteUserAsync(string externalId, CancellationToken ct)
    {
        await _graphClient.Users[externalId].DeleteAsync(cancellationToken: ct);
    }
}
