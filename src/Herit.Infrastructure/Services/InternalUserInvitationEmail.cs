namespace Herit.Infrastructure.Services;

/// <summary>Shared subject/body for the internal-user invitation email, used by every <see cref="Herit.Application.Interfaces.IEmailService"/> implementation.</summary>
internal static class InternalUserInvitationEmail
{
    public const string Subject = "You've been invited to Herit";

    public static string BuildBody(string displayName, string staffAppUrl) =>
        $"""
        Hi {displayName},

        Your Herit account is ready. Sign in at {staffAppUrl} and click "Forgot password?" on the sign-in page to set your password.

        Welcome to Herit.
        """;
}
