using Herit.Domain.Enums;
using EoiEntity = Herit.Domain.Entities.Eoi;
using UserEntity = Herit.Domain.Entities.User;

namespace Herit.Application.Features.Eoi.Dtos;

/// <summary>
/// EOI list/detail response shape. Submitter name is always included so the inbox can
/// display who applied instead of an invented reference like a GUID fragment; the
/// submitter's email is included only for staff callers, since the proposal owner has no
/// channel-of-contact need until an EOI is approved (see issue #285).
/// </summary>
public record EoiResponseDto(
    Guid Id,
    string Message,
    Guid CfeoiId,
    EoiStatus Status,
    EoiVisibility Visibility,
    Guid SubmittedById,
    string SubmitterName,
    string? SubmitterEmail)
{
    public static EoiResponseDto From(EoiEntity eoi, UserEntity? submitter, bool includeSubmitterEmail)
        => new(
            eoi.Id,
            eoi.Message,
            eoi.CfeoiId,
            eoi.Status,
            eoi.Visibility,
            eoi.SubmittedById,
            submitter?.FullName ?? "Unknown submitter",
            includeSubmitterEmail ? submitter?.Email : null);
}
