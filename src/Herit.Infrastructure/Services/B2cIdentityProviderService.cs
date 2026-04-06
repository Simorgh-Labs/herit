using Azure.Identity;
using Herit.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using Microsoft.Graph.Models;

namespace Herit.Infrastructure.Services;

public class B2cIdentityProviderService : IIdentityProviderService
{
    private readonly GraphServiceClient _graphClient;
    private readonly string _b2cExtensionAppId;

    public B2cIdentityProviderService(IConfiguration configuration)
    {
        var tenantId = configuration["AzureAdB2C:TenantId"]
            ?? throw new InvalidOperationException("AzureAdB2C:TenantId is not configured.");
        var clientId = configuration["AzureAdB2C:ClientId"]
            ?? throw new InvalidOperationException("AzureAdB2C:ClientId is not configured.");
        var clientSecret = configuration["AzureAdB2C:ClientSecret"]
            ?? throw new InvalidOperationException("AzureAdB2C:ClientSecret is not configured.");
        _b2cExtensionAppId = configuration["AzureAdB2C:ExtensionAppId"]
            ?? throw new InvalidOperationException("AzureAdB2C:ExtensionAppId is not configured.");

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
                    Issuer = _b2cExtensionAppId,
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
