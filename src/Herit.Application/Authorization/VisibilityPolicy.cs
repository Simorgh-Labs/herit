using Herit.Domain.Entities;
using Herit.Domain.Enums;

namespace Herit.Application.Authorization;

/// <summary>
/// Central authorization rules that decide which records a caller may see on the
/// public list endpoints. These mirror the visibility and access rules in the PRD (§8)
/// and the portal user-flow spec, and are enforced server-side so that content is never
/// delivered to a caller who is not permitted to view it.
/// </summary>
public static class VisibilityPolicy
{
    /// <summary>
    /// Government/administrative users (anyone who is not an <see cref="UserRole.Expat"/>)
    /// have privileged read access across the platform.
    /// </summary>
    public static bool IsStaff(User? user)
        => user is not null && user.Role != UserRole.Expat;

    /// <summary>
    /// Proposal visibility: Public → everyone (including anonymous); Shared → any
    /// authenticated user; Private → the owner only. Staff may view all proposals.
    /// </summary>
    public static bool CanViewProposal(Proposal proposal, User? user)
    {
        if (IsStaff(user))
            return true;

        return proposal.Visibility switch
        {
            ProposalVisibility.Public => true,
            ProposalVisibility.Shared => user is not null,
            ProposalVisibility.Private => user is not null && proposal.AuthorId == user.Id,
            _ => false
        };
    }

    /// <summary>
    /// RFP visibility: only Published RFPs are visible to non-staff callers. Staff may
    /// view RFPs in any status.
    /// </summary>
    public static bool CanViewRfp(Rfp rfp, User? user)
    {
        if (IsStaff(user))
            return true;

        return rfp.Status == RfpStatus.Published;
    }

    /// <summary>
    /// EOI visibility: the submitter always sees their own EOI; relevant staff see all
    /// EOIs; the parent proposal's owner sees Shared EOIs. Private EOIs are otherwise
    /// visible to the submitter only.
    /// </summary>
    public static bool CanViewEoi(Eoi eoi, User? user, Guid proposalOwnerId)
    {
        if (user is null)
            return false;

        if (eoi.SubmittedById == user.Id)
            return true;

        if (IsStaff(user))
            return true;

        return eoi.Visibility == EoiVisibility.Shared && proposalOwnerId == user.Id;
    }
}
