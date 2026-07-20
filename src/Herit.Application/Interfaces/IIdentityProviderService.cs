namespace Herit.Application.Interfaces;

public interface IIdentityProviderService
{
    /// <summary>
    /// Creates a local external identity account for the email address and returns its object ID.
    /// The account is created with a random, unreturned password and
    /// <c>ForceChangePasswordNextSignIn</c>; the caller is responsible for sending the user an
    /// invitation to set up their own credentials via SSPR.
    /// </summary>
    Task<string> CreateUserAsync(string email, string displayName, CancellationToken ct);

    /// <summary>Deletes the external identity account identified by <paramref name="externalId"/>.</summary>
    Task DeleteUserAsync(string externalId, CancellationToken ct);
}
