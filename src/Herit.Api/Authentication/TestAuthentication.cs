using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace Herit.Api.Authentication;

/// <summary>
/// Symmetric-key JWT authentication used exclusively by the Playwright E2E suite.
/// Tokens are minted by the test harness with the shared signing key from
/// <c>TestAuth:SigningKey</c> and carry the same claims the API reads from Entra
/// tokens (<c>oid</c>, <c>email</c>, <c>name</c>), so the whole downstream pipeline
/// (JIT registration, role resolution, visibility policies) runs unchanged.
/// The scheme can never be active in Production: <see cref="IsEnabled"/> requires
/// both the config flag and a non-Production environment, and no shipped
/// configuration sets the flag.
/// </summary>
public static class TestAuthentication
{
    public const string Scheme = "TestAuth";
    public const string Issuer = "https://herit-e2e.local";
    public const string Audience = "herit-api-e2e";
    private const string SelectorScheme = "TestAuthSelector";

    public static bool IsEnabled(IConfiguration configuration, IHostEnvironment environment)
        => configuration.GetValue<bool>("TestAuth:Enabled") && !environment.IsProduction();

    public static void AddTestAuthentication(this WebApplicationBuilder builder)
    {
        var signingKey = builder.Configuration["TestAuth:SigningKey"];
        if (string.IsNullOrWhiteSpace(signingKey))
            throw new InvalidOperationException("TestAuth:SigningKey must be configured when TestAuth is enabled.");

        builder.Services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = SelectorScheme;
            options.DefaultChallengeScheme = SelectorScheme;
        })
        .AddJwtBearer(Scheme, options =>
        {
            // Keep raw JWT claim names so ICurrentUserService sees "oid"/"email"/"name"
            // exactly as it does for Entra-issued tokens.
            options.MapInboundClaims = false;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidIssuer = Issuer,
                ValidAudience = Audience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey)),
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateIssuerSigningKey = true,
                ValidateLifetime = true,
            };
        })
        .AddPolicyScheme(SelectorScheme, SelectorScheme, options =>
        {
            // Route bearer tokens with the E2E issuer to the test scheme; everything
            // else continues to the regular Entra JWT bearer scheme.
            options.ForwardDefaultSelector = context =>
                HasTestIssuer(context.Request.Headers.Authorization.ToString())
                    ? Scheme
                    : JwtBearerDefaults.AuthenticationScheme;
        });
    }

    private static bool HasTestIssuer(string authorizationHeader)
    {
        const string bearerPrefix = "Bearer ";
        if (!authorizationHeader.StartsWith(bearerPrefix, StringComparison.OrdinalIgnoreCase))
            return false;

        var token = authorizationHeader[bearerPrefix.Length..];
        var handler = new JsonWebTokenHandler();
        return handler.CanReadToken(token) && new JsonWebToken(token).Issuer == Issuer;
    }
}
