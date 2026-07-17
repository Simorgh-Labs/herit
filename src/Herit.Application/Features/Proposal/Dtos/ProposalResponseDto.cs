using Herit.Domain.Enums;
using ProposalEntity = Herit.Domain.Entities.Proposal;
using UserEntity = Herit.Domain.Entities.User;
using OrganisationEntity = Herit.Domain.Entities.Organisation;

namespace Herit.Application.Features.Proposal.Dtos;

/// <summary>
/// Proposal list/detail response shape. Author and organisation names are resolved server-side
/// and always included — both are on the record the caller is already authorized to read
/// (list/detail endpoints are anonymous-readable), so no role-gating is needed (see issue #309).
/// </summary>
public record ProposalResponseDto(
    Guid Id,
    string Title,
    string ShortDescription,
    Guid AuthorId,
    string AuthorName,
    Guid OrganisationId,
    string OrganisationName,
    string LongDescription,
    ProposalStatus Status,
    ProposalVisibility Visibility,
    Guid? RfpId)
{
    public static ProposalResponseDto From(ProposalEntity proposal, UserEntity? author, OrganisationEntity? organisation)
        => new(
            proposal.Id,
            proposal.Title,
            proposal.ShortDescription,
            proposal.AuthorId,
            author?.FullName ?? "Unknown author",
            proposal.OrganisationId,
            organisation?.Name ?? "Unknown organisation",
            proposal.LongDescription,
            proposal.Status,
            proposal.Visibility,
            proposal.RfpId);
}
