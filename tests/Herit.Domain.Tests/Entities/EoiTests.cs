using Herit.Domain.Entities;
using Herit.Domain.Enums;

namespace Herit.Domain.Tests.Entities;

public class EoiTests
{
    private static Eoi CreatePendingEoi() =>
        Eoi.Create(Guid.NewGuid(), Guid.NewGuid(), "Message", Guid.NewGuid());

    // Create tests

    [Fact]
    public void Create_SetsPropertiesAndDefaultsToPendingPrivate()
    {
        var id = Guid.NewGuid();
        var submittedById = Guid.NewGuid();
        var cfeoiId = Guid.NewGuid();

        var eoi = Eoi.Create(id, submittedById, "My message", cfeoiId);

        Assert.Equal(id, eoi.Id);
        Assert.Equal(submittedById, eoi.SubmittedById);
        Assert.Equal("My message", eoi.Message);
        Assert.Equal(cfeoiId, eoi.CfeoiId);
        Assert.Equal(EoiStatus.Pending, eoi.Status);
        Assert.Equal(EoiVisibility.Private, eoi.Visibility);
    }

    // TransitionStatus — legal transitions

    [Fact]
    public void TransitionStatus_PendingToApproved_Succeeds()
    {
        var eoi = CreatePendingEoi();

        eoi.TransitionStatus(EoiStatus.Approved);

        Assert.Equal(EoiStatus.Approved, eoi.Status);
    }

    [Fact]
    public void TransitionStatus_PendingToRejected_Succeeds()
    {
        var eoi = CreatePendingEoi();

        eoi.TransitionStatus(EoiStatus.Rejected);

        Assert.Equal(EoiStatus.Rejected, eoi.Status);
    }

    // TransitionStatus — illegal transitions

    [Fact]
    public void TransitionStatus_PendingToPending_Throws()
    {
        var eoi = CreatePendingEoi();

        Assert.Throws<InvalidOperationException>(() => eoi.TransitionStatus(EoiStatus.Pending));
    }

    [Fact]
    public void TransitionStatus_ApprovedToPending_Throws()
    {
        var eoi = CreatePendingEoi();
        eoi.TransitionStatus(EoiStatus.Approved);

        Assert.Throws<InvalidOperationException>(() => eoi.TransitionStatus(EoiStatus.Pending));
    }

    // SetVisibility tests

    [Fact]
    public void SetVisibility_UpdatesVisibility()
    {
        var eoi = CreatePendingEoi();

        eoi.SetVisibility(EoiVisibility.Shared);

        Assert.Equal(EoiVisibility.Shared, eoi.Visibility);
    }
}
