namespace Herit.Application.Interfaces;

public interface IEmailService
{
    /// <summary>
    /// Sends an internal user their invitation email: the account is ready, and they set their
    /// own password via Forgot password? (SSPR) on the sign-in page.
    /// </summary>
    Task SendInternalUserInvitationAsync(string email, string displayName, CancellationToken ct);
}
