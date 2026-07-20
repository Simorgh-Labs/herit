using Herit.Infrastructure.Services;
using Microsoft.Extensions.Configuration;

namespace Herit.Infrastructure.Tests.Services;

public class AcsEmailServiceTests
{
    private static IConfiguration BuildConfiguration(params string[] omittedKeys)
    {
        var settings = new Dictionary<string, string?>
        {
            ["Email:AcsConnectionString"] = "endpoint=https://example.communication.azure.com/;accesskey=key",
            ["Email:SenderAddress"] = "no-reply@example.com",
            ["AzureAd:InviteRedirectUrl"] = "https://staff.example.com",
        };

        foreach (var key in omittedKeys)
            settings.Remove(key);

        return new ConfigurationBuilder().AddInMemoryCollection(settings).Build();
    }

    [Fact]
    public void Constructor_WithAllRequiredSettings_Succeeds()
    {
        var service = new AcsEmailService(BuildConfiguration());

        Assert.NotNull(service);
    }

    [Theory]
    [InlineData("Email:AcsConnectionString")]
    [InlineData("Email:SenderAddress")]
    [InlineData("AzureAd:InviteRedirectUrl")]
    public void Constructor_WithMissingSetting_Throws(string omittedKey)
    {
        var configuration = BuildConfiguration(omittedKey);

        var ex = Assert.Throws<InvalidOperationException>(
            () => new AcsEmailService(configuration));

        Assert.Equal($"{omittedKey} is not configured.", ex.Message);
    }
}
