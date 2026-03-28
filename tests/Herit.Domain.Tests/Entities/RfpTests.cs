using Herit.Domain.Entities;
using Herit.Domain.Enums;

namespace Herit.Domain.Tests.Entities;

public class RfpTests
{
    private static Rfp CreateDraftRfp() =>
        Rfp.Create(Guid.NewGuid(), "Title", "Short", Guid.NewGuid(), Guid.NewGuid(), "Long");

    // Update tests

    [Fact]
    public void Update_SetsContentFields()
    {
        var rfp = CreateDraftRfp();

        rfp.Update("New Title", "New Short", "New Long");

        Assert.Equal("New Title", rfp.Title);
        Assert.Equal("New Short", rfp.ShortDescription);
        Assert.Equal("New Long", rfp.LongDescription);
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
