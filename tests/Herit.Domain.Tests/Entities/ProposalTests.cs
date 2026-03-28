using Herit.Domain.Entities;
using Herit.Domain.Enums;

namespace Herit.Domain.Tests.Entities;

public class ProposalTests
{
    private static Proposal CreateIdeationProposal() =>
        Proposal.Create(Guid.NewGuid(), "Title", "Short", Guid.NewGuid(), Guid.NewGuid(), "Long");

    // Create tests

    [Fact]
    public void Create_SetsDefaultStatusAndVisibility()
    {
        var proposal = CreateIdeationProposal();

        Assert.Equal(ProposalStatus.Ideation, proposal.Status);
        Assert.Equal(ProposalVisibility.Private, proposal.Visibility);
    }

    // Update tests

    [Fact]
    public void Update_SetsContentFields()
    {
        var proposal = CreateIdeationProposal();

        proposal.Update("New Title", "New Short", "New Long");

        Assert.Equal("New Title", proposal.Title);
        Assert.Equal("New Short", proposal.ShortDescription);
        Assert.Equal("New Long", proposal.LongDescription);
    }

    // TransitionStatus — legal transitions

    [Fact]
    public void TransitionStatus_IdeationToResourcing_Succeeds()
    {
        var proposal = CreateIdeationProposal();

        proposal.TransitionStatus(ProposalStatus.Resourcing);

        Assert.Equal(ProposalStatus.Resourcing, proposal.Status);
    }

    [Fact]
    public void TransitionStatus_ResourcingToSubmitted_Succeeds()
    {
        var proposal = CreateIdeationProposal();
        proposal.TransitionStatus(ProposalStatus.Resourcing);

        proposal.TransitionStatus(ProposalStatus.Submitted);

        Assert.Equal(ProposalStatus.Submitted, proposal.Status);
    }

    [Fact]
    public void TransitionStatus_SubmittedToUnderReview_Succeeds()
    {
        var proposal = CreateIdeationProposal();
        proposal.TransitionStatus(ProposalStatus.Resourcing);
        proposal.TransitionStatus(ProposalStatus.Submitted);

        proposal.TransitionStatus(ProposalStatus.UnderReview);

        Assert.Equal(ProposalStatus.UnderReview, proposal.Status);
    }

    [Fact]
    public void TransitionStatus_SubmittedToResourcing_Succeeds()
    {
        var proposal = CreateIdeationProposal();
        proposal.TransitionStatus(ProposalStatus.Resourcing);
        proposal.TransitionStatus(ProposalStatus.Submitted);

        proposal.TransitionStatus(ProposalStatus.Resourcing);

        Assert.Equal(ProposalStatus.Resourcing, proposal.Status);
    }

    [Fact]
    public void TransitionStatus_UnderReviewToApproved_Succeeds()
    {
        var proposal = CreateIdeationProposal();
        proposal.TransitionStatus(ProposalStatus.Resourcing);
        proposal.TransitionStatus(ProposalStatus.Submitted);
        proposal.TransitionStatus(ProposalStatus.UnderReview);

        proposal.TransitionStatus(ProposalStatus.Approved);

        Assert.Equal(ProposalStatus.Approved, proposal.Status);
    }

    // TransitionStatus — illegal transitions

    [Fact]
    public void TransitionStatus_IdeationToSubmitted_Throws()
    {
        var proposal = CreateIdeationProposal();

        Assert.Throws<InvalidOperationException>(() => proposal.TransitionStatus(ProposalStatus.Submitted));
    }

    [Fact]
    public void TransitionStatus_ResourcingToIdeation_Throws()
    {
        var proposal = CreateIdeationProposal();
        proposal.TransitionStatus(ProposalStatus.Resourcing);

        Assert.Throws<InvalidOperationException>(() => proposal.TransitionStatus(ProposalStatus.Ideation));
    }

    [Fact]
    public void TransitionStatus_SubmittedToApproved_Throws()
    {
        var proposal = CreateIdeationProposal();
        proposal.TransitionStatus(ProposalStatus.Resourcing);
        proposal.TransitionStatus(ProposalStatus.Submitted);

        Assert.Throws<InvalidOperationException>(() => proposal.TransitionStatus(ProposalStatus.Approved));
    }

    [Fact]
    public void TransitionStatus_UnderReviewToResourcing_Throws()
    {
        var proposal = CreateIdeationProposal();
        proposal.TransitionStatus(ProposalStatus.Resourcing);
        proposal.TransitionStatus(ProposalStatus.Submitted);
        proposal.TransitionStatus(ProposalStatus.UnderReview);

        Assert.Throws<InvalidOperationException>(() => proposal.TransitionStatus(ProposalStatus.Resourcing));
    }

    [Fact]
    public void TransitionStatus_ApprovedToUnderReview_Throws()
    {
        var proposal = CreateIdeationProposal();
        proposal.TransitionStatus(ProposalStatus.Resourcing);
        proposal.TransitionStatus(ProposalStatus.Submitted);
        proposal.TransitionStatus(ProposalStatus.UnderReview);
        proposal.TransitionStatus(ProposalStatus.Approved);

        Assert.Throws<InvalidOperationException>(() => proposal.TransitionStatus(ProposalStatus.UnderReview));
    }

    // SetVisibility tests

    [Fact]
    public void SetVisibility_UpdatesVisibility()
    {
        var proposal = CreateIdeationProposal();

        proposal.SetVisibility(ProposalVisibility.Public);

        Assert.Equal(ProposalVisibility.Public, proposal.Visibility);
    }

    [Fact]
    public void SetVisibility_CanSetToShared()
    {
        var proposal = CreateIdeationProposal();

        proposal.SetVisibility(ProposalVisibility.Shared);

        Assert.Equal(ProposalVisibility.Shared, proposal.Visibility);
    }
}
