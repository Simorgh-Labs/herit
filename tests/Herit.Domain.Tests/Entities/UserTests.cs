using Herit.Domain.Entities;
using Herit.Domain.Enums;

namespace Herit.Domain.Tests.Entities;

public class UserTests
{
    // Create tests

    [Fact]
    public void Create_SetsRequiredPropertiesCorrectly()
    {
        var id = Guid.NewGuid();

        var user = User.Create(id, "ext-1", "user@example.com", "Jane Doe", UserRole.Expat);

        Assert.Equal(id, user.Id);
        Assert.Equal("ext-1", user.ExternalId);
        Assert.Equal("user@example.com", user.Email);
        Assert.Equal("Jane Doe", user.FullName);
        Assert.Equal(UserRole.Expat, user.Role);
        Assert.Null(user.OrganisationId);
        Assert.Null(user.Nationality);
        Assert.Null(user.Location);
        Assert.Null(user.ExpertiseTags);
        Assert.Null(user.TermsAcceptedAt);
    }

    [Fact]
    public void Create_WithAllOptionalFields_SetsThemCorrectly()
    {
        var id = Guid.NewGuid();
        var orgId = Guid.NewGuid();
        var termsAt = DateTimeOffset.UtcNow;

        var user = User.Create(id, "ext-1", "user@example.com", "Jane Doe", UserRole.Expat,
            organisationId: orgId,
            nationality: "Australian",
            location: "Sydney, AU",
            expertiseTags: "C#,Azure",
            termsAcceptedAt: termsAt);

        Assert.Equal(orgId, user.OrganisationId);
        Assert.Equal("Australian", user.Nationality);
        Assert.Equal("Sydney, AU", user.Location);
        Assert.Equal("C#,Azure", user.ExpertiseTags);
        Assert.Equal(termsAt, user.TermsAcceptedAt);
    }

    // Update tests

    [Fact]
    public void Update_SetsEmailAndFullName()
    {
        var user = User.Create(Guid.NewGuid(), "ext-1", "old@example.com", "Old Name", UserRole.Staff);

        user.Update("new@example.com", "New Name");

        Assert.Equal("new@example.com", user.Email);
        Assert.Equal("New Name", user.FullName);
    }

    // UpdateProfile tests

    [Fact]
    public void UpdateProfile_SetsAllProfileFields()
    {
        var user = User.Create(Guid.NewGuid(), "ext-1", "user@example.com", "Jane Doe", UserRole.Expat);
        var termsAt = DateTimeOffset.UtcNow;

        user.UpdateProfile("Australian", "Sydney, AU", "C#,Azure", termsAt);

        Assert.Equal("Australian", user.Nationality);
        Assert.Equal("Sydney, AU", user.Location);
        Assert.Equal("C#,Azure", user.ExpertiseTags);
        Assert.Equal(termsAt, user.TermsAcceptedAt);
    }

    [Fact]
    public void UpdateProfile_ClearsFieldsWhenNullPassed()
    {
        var user = User.Create(Guid.NewGuid(), "ext-1", "user@example.com", "Jane Doe", UserRole.Expat,
            nationality: "Australian", location: "Sydney");

        user.UpdateProfile();

        Assert.Null(user.Nationality);
        Assert.Null(user.Location);
        Assert.Null(user.ExpertiseTags);
        Assert.Null(user.TermsAcceptedAt);
    }

    [Fact]
    public void UpdateProfile_DoesNotAffectEmailOrFullName()
    {
        var user = User.Create(Guid.NewGuid(), "ext-1", "user@example.com", "Jane Doe", UserRole.Expat);

        user.UpdateProfile("Australian");

        Assert.Equal("user@example.com", user.Email);
        Assert.Equal("Jane Doe", user.FullName);
    }
}
