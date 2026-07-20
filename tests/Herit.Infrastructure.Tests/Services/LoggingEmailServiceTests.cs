using Herit.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;

namespace Herit.Infrastructure.Tests.Services;

public class LoggingEmailServiceTests
{
    private static IConfiguration BuildConfiguration(params string[] omittedKeys)
    {
        var settings = new Dictionary<string, string?>
        {
            ["AzureAd:InviteRedirectUrl"] = "https://staff.example.com",
        };

        foreach (var key in omittedKeys)
            settings.Remove(key);

        return new ConfigurationBuilder().AddInMemoryCollection(settings).Build();
    }

    [Fact]
    public void Constructor_WithAllRequiredSettings_Succeeds()
    {
        var service = new LoggingEmailService(BuildConfiguration(), NullLogger<LoggingEmailService>.Instance);

        Assert.NotNull(service);
    }

    [Fact]
    public void Constructor_WithMissingSetting_Throws()
    {
        var configuration = BuildConfiguration("AzureAd:InviteRedirectUrl");

        var ex = Assert.Throws<InvalidOperationException>(
            () => new LoggingEmailService(configuration, NullLogger<LoggingEmailService>.Instance));

        Assert.Equal("AzureAd:InviteRedirectUrl is not configured.", ex.Message);
    }

    [Fact]
    public async Task SendInternalUserInvitationAsync_DoesNotThrow()
    {
        var service = new LoggingEmailService(BuildConfiguration(), NullLogger<LoggingEmailService>.Instance);

        await service.SendInternalUserInvitationAsync("user@example.com", "Test User", CancellationToken.None);
    }
}
