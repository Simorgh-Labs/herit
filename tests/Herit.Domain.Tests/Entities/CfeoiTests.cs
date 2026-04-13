using Herit.Domain.Entities;
using Herit.Domain.Enums;

namespace Herit.Domain.Tests.Entities;

public class CfeoiTests
{
    private static Cfeoi CreateOpenCfeoi() =>
        Cfeoi.Create(Guid.NewGuid(), "Title", "Description", CfeoiResourceType.Human, Guid.NewGuid());

    // Create tests

    [Fact]
    public void Create_SetsPropertiesAndDefaultsToOpen()
    {
        var id = Guid.NewGuid();
        var proposalId = Guid.NewGuid();

        var cfeoi = Cfeoi.Create(id, "Title", "Description", CfeoiResourceType.Human, proposalId);

        Assert.Equal(id, cfeoi.Id);
        Assert.Equal("Title", cfeoi.Title);
        Assert.Equal("Description", cfeoi.Description);
        Assert.Equal(CfeoiResourceType.Human, cfeoi.ResourceType);
        Assert.Equal(proposalId, cfeoi.ProposalId);
        Assert.Equal(CfeoiStatus.Open, cfeoi.Status);
    }

    // Update tests

    [Fact]
    public void Update_SetsAllMutableFields()
    {
        var cfeoi = CreateOpenCfeoi();

        cfeoi.Update("New Title", "New Desc", CfeoiResourceType.NonHuman);

        Assert.Equal("New Title", cfeoi.Title);
        Assert.Equal("New Desc", cfeoi.Description);
        Assert.Equal(CfeoiResourceType.NonHuman, cfeoi.ResourceType);
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
