using Herit.Domain.Entities;
using Herit.Domain.Enums;

namespace Herit.Domain.Tests.Entities;

public class RfpTests
{
    private static Rfp CreateDraftRfp(string? tags = null) =>
        Rfp.Create(Guid.NewGuid(), "Title", "Short", Guid.NewGuid(), Guid.NewGuid(), "Long", tags);

    // Create tests

    [Fact]
    public void Create_WithTags_SetsTags()
    {
        var rfp = CreateDraftRfp(tags: "heritage,culture");

        Assert.Equal("heritage,culture", rfp.Tags);
    }

    [Fact]
    public void Create_WithNullTags_TagsIsNull()
    {
        var rfp = CreateDraftRfp();

        Assert.Null(rfp.Tags);
    }

    // Update tests

    [Fact]
    public void Update_SetsContentFields()
    {
        var rfp = CreateDraftRfp();

        rfp.Update("New Title", "New Short", "New Long", "music,dance");

        Assert.Equal("New Title", rfp.Title);
        Assert.Equal("New Short", rfp.ShortDescription);
        Assert.Equal("New Long", rfp.LongDescription);
        Assert.Equal("music,dance", rfp.Tags);
    }

    [Fact]
    public void Update_WithNullTags_ClearsTags()
    {
        var rfp = CreateDraftRfp(tags: "old-tag");

        rfp.Update("Title", "Short", "Long", null);

        Assert.Null(rfp.Tags);
    }

    // TransitionStatus — legal transitions

    [Fact]
    public void TransitionStatus_DraftToApproved_Succeeds()
    {
        var rfp = CreateDraftRfp();

        rfp.TransitionStatus(RfpStatus.Approved);

        Assert.Equal(RfpStatus.Approved, rfp.Status);
    }

    [Fact]
    public void TransitionStatus_ApprovedToPublished_Succeeds()
    {
        var rfp = CreateDraftRfp();
        rfp.TransitionStatus(RfpStatus.Approved);

        rfp.TransitionStatus(RfpStatus.Published);

        Assert.Equal(RfpStatus.Published, rfp.Status);
    }

    // TransitionStatus — illegal transitions

    [Fact]
    public void TransitionStatus_DraftToPublished_Throws()
    {
        var rfp = CreateDraftRfp();

        Assert.Throws<InvalidOperationException>(() => rfp.TransitionStatus(RfpStatus.Published));
    }

    [Fact]
    public void TransitionStatus_PublishedToDraft_Throws()
    {
        var rfp = CreateDraftRfp();
        rfp.TransitionStatus(RfpStatus.Approved);
        rfp.TransitionStatus(RfpStatus.Published);

        Assert.Throws<InvalidOperationException>(() => rfp.TransitionStatus(RfpStatus.Draft));
    }

    [Fact]
    public void TransitionStatus_PublishedToApproved_Throws()
    {
        var rfp = CreateDraftRfp();
        rfp.TransitionStatus(RfpStatus.Approved);
        rfp.TransitionStatus(RfpStatus.Published);

        Assert.Throws<InvalidOperationException>(() => rfp.TransitionStatus(RfpStatus.Approved));
    }
}
