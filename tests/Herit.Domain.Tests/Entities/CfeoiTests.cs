using Herit.Domain.Entities;
using Herit.Domain.Enums;

namespace Herit.Domain.Tests.Entities;

public class CfeoiTests
{
    private static Cfeoi CreateOpenCfeoi(string? tags = null) =>
        Cfeoi.Create(Guid.NewGuid(), "Title", "Description", CfeoiResourceType.Human, Guid.NewGuid(), tags);

    // Create tests

    [Fact]
    public void Create_SetsPropertiesAndDefaultsToOpen()
    {
        var id = Guid.NewGuid();
        var proposalId = Guid.NewGuid();

        var cfeoi = Cfeoi.Create(id, "Title", "Description", CfeoiResourceType.Human, proposalId, "heritage,culture");

        Assert.Equal(id, cfeoi.Id);
        Assert.Equal("Title", cfeoi.Title);
        Assert.Equal("Description", cfeoi.Description);
        Assert.Equal(CfeoiResourceType.Human, cfeoi.ResourceType);
        Assert.Equal(proposalId, cfeoi.ProposalId);
        Assert.Equal(CfeoiStatus.Open, cfeoi.Status);
        Assert.Equal("heritage,culture", cfeoi.Tags);
    }

    [Fact]
    public void Create_WithNullTags_TagsIsNull()
    {
        var cfeoi = CreateOpenCfeoi();

        Assert.Null(cfeoi.Tags);
    }

    // Update tests

    [Fact]
    public void Update_SetsAllMutableFields()
    {
        var cfeoi = CreateOpenCfeoi();

        cfeoi.Update("New Title", "New Desc", CfeoiResourceType.NonHuman, "music,dance");

        Assert.Equal("New Title", cfeoi.Title);
        Assert.Equal("New Desc", cfeoi.Description);
        Assert.Equal(CfeoiResourceType.NonHuman, cfeoi.ResourceType);
        Assert.Equal("music,dance", cfeoi.Tags);
    }

    [Fact]
    public void Update_WithNullTags_ClearsTags()
    {
        var cfeoi = CreateOpenCfeoi(tags: "old-tag");

        cfeoi.Update("Title", "Desc", CfeoiResourceType.Human, null);

        Assert.Null(cfeoi.Tags);
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
