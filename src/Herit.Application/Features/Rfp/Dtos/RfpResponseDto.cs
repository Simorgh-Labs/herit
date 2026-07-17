using Herit.Domain.Enums;
using RfpEntity = Herit.Domain.Entities.Rfp;
using UserEntity = Herit.Domain.Entities.User;
using OrganisationEntity = Herit.Domain.Entities.Organisation;

namespace Herit.Application.Features.Rfp.Dtos;

/// <summary>
/// RFP list/detail response shape. Author and organisation names are resolved server-side
/// and always included — both are on the record the caller is already authorized to read
/// (list/detail endpoints are anonymous-readable), so no role-gating is needed (see issue #309).
/// </summary>
public record RfpResponseDto(
    Guid Id,
    string Title,
    string ShortDescription,
    Guid AuthorId,
    string AuthorName,
    Guid OrganisationId,
    string OrganisationName,
    string LongDescription,
    RfpStatus Status,
    string? Tags)
{
    public static RfpResponseDto From(RfpEntity rfp, UserEntity? author, OrganisationEntity? organisation)
        => new(
            rfp.Id,
            rfp.Title,
            rfp.ShortDescription,
            rfp.AuthorId,
            author?.FullName ?? "Unknown author",
            rfp.OrganisationId,
            organisation?.Name ?? "Unknown organisation",
            rfp.LongDescription,
            rfp.Status,
            rfp.Tags);
}
