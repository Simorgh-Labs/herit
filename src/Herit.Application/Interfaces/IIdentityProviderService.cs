namespace Herit.Application.Interfaces;

public interface IIdentityProviderService
{
    /// <summary>Creates an external identity account and returns its object ID.</summary>
    Task<string> CreateUserAsync(string email, string displayName, CancellationToken ct);

    /// <summary>Deletes the external identity account identified by <paramref name="externalId"/>.</summary>
    Task DeleteUserAsync(string externalId, CancellationToken ct);
}
