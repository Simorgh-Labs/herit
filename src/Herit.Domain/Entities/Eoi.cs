using Herit.Domain.Enums;

namespace Herit.Domain.Entities;

public class Eoi
{
    private static readonly Dictionary<EoiStatus, EoiStatus[]> AllowedTransitions = new()
    {
        [EoiStatus.Pending] = [EoiStatus.Approved, EoiStatus.Rejected],
        [EoiStatus.Approved] = [],
        [EoiStatus.Rejected] = []
    };

    public Guid Id { get; private set; }
    public Guid SubmittedById { get; private set; }
    public string Message { get; private set; } = default!;
    public Guid CfeoiId { get; private set; }
    public EoiStatus Status { get; private set; }
    public EoiVisibility Visibility { get; private set; }

    private Eoi() { }

    public static Eoi Create(Guid id, Guid submittedById, string message, Guid cfeoiId)
    {
        return new Eoi
        {
            Id = id,
            SubmittedById = submittedById,
            Message = message,
            CfeoiId = cfeoiId,
            Status = EoiStatus.Pending,
            Visibility = EoiVisibility.Private
        };
    }

    public void TransitionStatus(EoiStatus newStatus)
    {
        if (!AllowedTransitions[Status].Contains(newStatus))
            throw new InvalidOperationException($"Cannot transition from {Status} to {newStatus}.");

        Status = newStatus;
    }

    public void SetVisibility(EoiVisibility visibility)
    {
        Visibility = visibility;
    }
}
