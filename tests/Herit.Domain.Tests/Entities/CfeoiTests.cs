using Herit.Domain.Entities;
using Herit.Domain.Enums;

namespace Herit.Domain.Tests.Entities;

public class CfeoiTests
{
    private static Cfeoi CreateOpenCfeoi() =>
        Cfeoi.Create(Guid.NewGuid(), "Title", "Description", CfeoiResourceType.Human, Guid.NewGuid(), "Engineer", "C#", 2);

    // Create tests

    [Fact]
    public void Create_SetsPropertiesAndDefaultsToOpen()
    {
        var id = Guid.NewGuid();
        var proposalId = Guid.NewGuid();

        var cfeoi = Cfeoi.Create(
            id, "Title", "Description", CfeoiResourceType.Human, proposalId,
            "Engineer", "C#, SQL", 3, durationWeeks: 8, location: "Remote",
            compensation: "Volunteer", deadline: new DateOnly(2026, 6, 1), externalLinks: "https://example.com");

        Assert.Equal(id, cfeoi.Id);
        Assert.Equal("Title", cfeoi.Title);
        Assert.Equal("Description", cfeoi.Description);
        Assert.Equal(CfeoiResourceType.Human, cfeoi.ResourceType);
        Assert.Equal(proposalId, cfeoi.ProposalId);
        Assert.Equal(CfeoiStatus.Open, cfeoi.Status);
        Assert.Equal("Engineer", cfeoi.RoleTitle);
        Assert.Equal("C#, SQL", cfeoi.Skills);
        Assert.Equal(3, cfeoi.Slots);
        Assert.Equal(8, cfeoi.DurationWeeks);
        Assert.Equal("Remote", cfeoi.Location);
        Assert.Equal("Volunteer", cfeoi.Compensation);
        Assert.Equal(new DateOnly(2026, 6, 1), cfeoi.Deadline);
        Assert.Equal("https://example.com", cfeoi.ExternalLinks);
    }

    [Fact]
    public void Create_OptionalFieldsDefault_ToNull()
    {
        var cfeoi = Cfeoi.Create(Guid.NewGuid(), "Title", "Description", CfeoiResourceType.Human, Guid.NewGuid(), "Engineer", "C#", 1);

        Assert.Null(cfeoi.DurationWeeks);
        Assert.Null(cfeoi.Location);
        Assert.Null(cfeoi.Compensation);
        Assert.Null(cfeoi.Deadline);
        Assert.Null(cfeoi.ExternalLinks);
    }

    // Update tests

    [Fact]
    public void Update_SetsAllMutableFields()
    {
        var cfeoi = CreateOpenCfeoi();

        cfeoi.Update("New Title", "New Desc", CfeoiResourceType.NonHuman, "Analyst", "Python", 5,
            durationWeeks: 12, location: "Onsite", compensation: "Paid", deadline: new DateOnly(2026, 9, 1), externalLinks: "https://link.com");

        Assert.Equal("New Title", cfeoi.Title);
        Assert.Equal("New Desc", cfeoi.Description);
        Assert.Equal(CfeoiResourceType.NonHuman, cfeoi.ResourceType);
        Assert.Equal("Analyst", cfeoi.RoleTitle);
        Assert.Equal("Python", cfeoi.Skills);
        Assert.Equal(5, cfeoi.Slots);
        Assert.Equal(12, cfeoi.DurationWeeks);
        Assert.Equal("Onsite", cfeoi.Location);
        Assert.Equal("Paid", cfeoi.Compensation);
        Assert.Equal(new DateOnly(2026, 9, 1), cfeoi.Deadline);
        Assert.Equal("https://link.com", cfeoi.ExternalLinks);
    }

    [Fact]
    public void Update_ClearsOptionalFieldsWhenNull()
    {
        var cfeoi = Cfeoi.Create(Guid.NewGuid(), "T", "D", CfeoiResourceType.Human, Guid.NewGuid(),
            "Engineer", "C#", 1, durationWeeks: 4, location: "Remote");

        cfeoi.Update("T", "D", CfeoiResourceType.Human, "Engineer", "C#", 1);

        Assert.Null(cfeoi.DurationWeeks);
        Assert.Null(cfeoi.Location);
    }

    // TransitionStatus — legal transitions

    [Fact]
    public void TransitionStatus_OpenToClosed_Succeeds()
    {
        var cfeoi = CreateOpenCfeoi();

        cfeoi.TransitionStatus(CfeoiStatus.Closed);

        Assert.Equal(CfeoiStatus.Closed, cfeoi.Status);
    }

    // TransitionStatus — illegal transitions

    [Fact]
    public void TransitionStatus_OpenToOpen_Throws()
    {
        var cfeoi = CreateOpenCfeoi();

        Assert.Throws<InvalidOperationException>(() => cfeoi.TransitionStatus(CfeoiStatus.Open));
    }

    [Fact]
    public void TransitionStatus_ClosedToOpen_Throws()
    {
        var cfeoi = CreateOpenCfeoi();
        cfeoi.TransitionStatus(CfeoiStatus.Closed);

        Assert.Throws<InvalidOperationException>(() => cfeoi.TransitionStatus(CfeoiStatus.Open));
    }
}
