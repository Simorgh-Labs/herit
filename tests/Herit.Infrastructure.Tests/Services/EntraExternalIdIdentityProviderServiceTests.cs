using Herit.Infrastructure.Services;
using Microsoft.Extensions.Configuration;

namespace Herit.Infrastructure.Tests.Services;

public class EntraExternalIdIdentityProviderServiceTests
{
    private static IConfiguration BuildConfiguration(params string[] omittedKeys)
    {
        var settings = new Dictionary<string, string?>
        {
            ["AzureAd:TenantId"] = "00000000-0000-0000-0000-000000000001",
            ["AzureAd:ClientId"] = "00000000-0000-0000-0000-000000000002",
            ["AzureAd:ClientSecret"] = "secret-value",
            ["AzureAd:Domain"] = "staff.example.com",
        };

        foreach (var key in omittedKeys)
            settings.Remove(key);

        return new ConfigurationBuilder().AddInMemoryCollection(settings).Build();
    }

    [Fact]
    public void Constructor_WithAllRequiredSettings_Succeeds()
    {
        var service = new EntraExternalIdIdentityProviderService(BuildConfiguration());

        Assert.NotNull(service);
    }

    [Theory]
    [InlineData("AzureAd:TenantId")]
    [InlineData("AzureAd:ClientId")]
    [InlineData("AzureAd:ClientSecret")]
    [InlineData("AzureAd:Domain")]
    public void Constructor_WithMissingSetting_Throws(string omittedKey)
    {
        var configuration = BuildConfiguration(omittedKey);

        var ex = Assert.Throws<InvalidOperationException>(
            () => new EntraExternalIdIdentityProviderService(configuration));

        Assert.Equal($"{omittedKey} is not configured.", ex.Message);
    }
}
