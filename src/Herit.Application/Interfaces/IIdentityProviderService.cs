namespace Herit.Application.Interfaces;

public interface IIdentityProviderService
{
    /// <summary>Creates a B2C account and returns its object ID.</summary>
    Task<string> CreateUserAsync(string email, string displayName, CancellationToken ct);

    /// <summary>Deletes or disables the B2C account identified by <paramref name="externalId"/>.</summary>
    Task DeleteUserAsync(string externalId, CancellationToken ct);
}
