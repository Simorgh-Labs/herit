using System.Security.Cryptography;
using Azure.Identity;
using Herit.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Graph;
using Microsoft.Graph.Models;

namespace Herit.Infrastructure.Services;

public class EntraExternalIdIdentityProviderService : IIdentityProviderService
{
    private readonly GraphServiceClient _graphClient;
    private readonly string _domain;

    public EntraExternalIdIdentityProviderService(IConfiguration configuration)
    {
        var tenantId = configuration["AzureAd:TenantId"]
            ?? throw new InvalidOperationException("AzureAd:TenantId is not configured.");
        var clientId = configuration["AzureAd:ClientId"]
            ?? throw new InvalidOperationException("AzureAd:ClientId is not configured.");
        var clientSecret = configuration["AzureAd:ClientSecret"]
            ?? throw new InvalidOperationException("AzureAd:ClientSecret is not configured.");
        _domain = configuration["AzureAd:Domain"]
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
            Mail = email,
            Identities =
            [
                new ObjectIdentity
                {
                    SignInType = "emailAddress",
                    Issuer = _domain,
                    IssuerAssignedId = email,
                },
            ],
            PasswordProfile = new PasswordProfile
            {
                Password = GenerateTemporaryPassword(),
                ForceChangePasswordNextSignIn = true,
            },
            PasswordPolicies = "DisablePasswordExpiration",
        };

        var created = await _graphClient.Users.PostAsync(user, cancellationToken: ct)
            ?? throw new InvalidOperationException("Graph API returned null when creating the user.");

        return created.Id
            ?? throw new InvalidOperationException("Graph API did not return an object ID for the created user.");
    }

    /// <summary>
    /// Generates a random password meeting Entra's complexity requirements. It is set with
    /// <c>ForceChangePasswordNextSignIn</c> so the user never actually uses it; it must never
    /// be logged or returned.
    /// </summary>
    private static string GenerateTemporaryPassword()
    {
        const string lower = "abcdefghijkmnopqrstuvwxyz";
        const string upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        const string digits = "23456789";
        const string special = "!@#$%^&*-_=+";
        const string all = lower + upper + digits + special;

        Span<char> password = stackalloc char[24];
        password[0] = lower[RandomNumberGenerator.GetInt32(lower.Length)];
        password[1] = upper[RandomNumberGenerator.GetInt32(upper.Length)];
        password[2] = digits[RandomNumberGenerator.GetInt32(digits.Length)];
        password[3] = special[RandomNumberGenerator.GetInt32(special.Length)];

        for (var i = 4; i < password.Length; i++)
            password[i] = all[RandomNumberGenerator.GetInt32(all.Length)];

        // Shuffle so the guaranteed-category characters aren't always in the first four slots.
        for (var i = password.Length - 1; i > 0; i--)
        {
            var j = RandomNumberGenerator.GetInt32(i + 1);
            (password[i], password[j]) = (password[j], password[i]);
        }

        return new string(password);
    }

    public async Task DeleteUserAsync(string externalId, CancellationToken ct)
    {
        await _graphClient.Users[externalId].DeleteAsync(cancellationToken: ct);
    }
}
