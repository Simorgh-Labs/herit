using Herit.Domain.Entities;
using Herit.Domain.Enums;

namespace Herit.Application.Authorization;

/// <summary>
/// Central authorization rules that decide which caller may perform a given mutation.
/// These mirror the actor rules in the portal user-flow spec (§3b–3e) and the PRD
/// (§3.3–3.4, §6) and are enforced server-side, alongside <see cref="VisibilityPolicy"/>,
/// so that ownership and role are never assumed from a coarse controller-level policy alone.
/// </summary>
public static class MutationPolicy
{
    /// <summary>
    /// Proposal content, visibility, and delete are owner actions; staff may also delete
    /// a proposal (PRD §6.1 S7).
    /// </summary>
    public static bool CanUpdateProposal(Proposal proposal, User user)
        => proposal.AuthorId == user.Id;

    public static bool CanSetProposalVisibility(Proposal proposal, User user)
        => proposal.AuthorId == user.Id;

    public static bool CanDeleteProposal(Proposal proposal, User user)
        => proposal.AuthorId == user.Id || VisibilityPolicy.IsStaff(user);

    /// <summary>
    /// Per-transition actor rules for proposal status (flow 3b): the owner drives
    /// Ideation → Resourcing → Submitted and Submitted → Withdrawn; staff drive
    /// Submitted → UnderReview → Approved. An owner may not approve their own
    /// proposal, and staff may not withdraw a proposal on the owner's behalf.
    /// </summary>
    public static bool CanTransitionProposalStatus(Proposal proposal, User user, ProposalStatus newStatus)
    {
        var isOwner = proposal.AuthorId == user.Id;
        var isStaff = VisibilityPolicy.IsStaff(user);

        return newStatus switch
        {
            ProposalStatus.Resourcing => isOwner,
            ProposalStatus.Submitted => isOwner,
            ProposalStatus.Withdrawn => isOwner,
            ProposalStatus.UnderReview => isStaff,
            ProposalStatus.Approved => isStaff,
            _ => false
        };
    }

    /// <summary>
    /// CFEOI update/close are actions for the owner of the parent proposal; staff may
    /// also publish, update, and close CFEOIs (PRD §6.1 S8).
    /// </summary>
    public static bool CanMutateCfeoi(Proposal parentProposal, User user)
        => parentProposal.AuthorId == user.Id || VisibilityPolicy.IsStaff(user);

    /// <summary>
    /// EOI visibility and withdrawal are actions for the submitter only (flow 3e).
    /// </summary>
    public static bool CanMutateEoi(Eoi eoi, User user)
        => eoi.SubmittedById == user.Id;
}
