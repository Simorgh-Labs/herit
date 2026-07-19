namespace Herit.Application.Interfaces;

public interface IIdentityProviderService
{
    /// <summary>
    /// Creates an external identity account by inviting the email address and returns its object ID.
    /// The identity provider sends the invitation email with the sign-in link.
    /// </summary>
    Task<string> CreateUserAsync(string email, string displayName, CancellationToken ct);

    /// <summary>Deletes the external identity account identified by <paramref name="externalId"/>.</summary>
    Task DeleteUserAsync(string externalId, CancellationToken ct);
}
