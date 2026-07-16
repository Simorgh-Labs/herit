using Herit.Application.Interfaces;

namespace Herit.Infrastructure.Services;

/// <summary>
/// Deterministic in-process replacement for <see cref="EntraExternalIdIdentityProviderService"/>,
/// registered only when E2E test authentication is enabled. It never talks to Microsoft Graph;
/// the returned external ID is derived from the email so the test harness can mint matching
/// tokens without reading seeder output.
/// </summary>
public class LocalTestIdentityProviderService : IIdentityProviderService
{
    public const string ExternalIdPrefix = "e2e-";

    public Task<string> CreateUserAsync(string email, string displayName, CancellationToken ct)
        => Task.FromResult(ExternalIdPrefix + email);

    public Task DeleteUserAsync(string externalId, CancellationToken ct)
        => Task.CompletedTask;
}
