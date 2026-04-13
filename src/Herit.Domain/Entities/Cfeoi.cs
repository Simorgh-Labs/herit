using Herit.Domain.Enums;

namespace Herit.Domain.Entities;

public class Cfeoi
{
    private static readonly Dictionary<CfeoiStatus, CfeoiStatus[]> AllowedTransitions = new()
    {
        [CfeoiStatus.Open] = [CfeoiStatus.Closed],
        [CfeoiStatus.Closed] = []
    };

    public Guid Id { get; private set; }
    public string Title { get; private set; } = default!;
    public string Description { get; private set; } = default!;
    public CfeoiResourceType ResourceType { get; private set; }
    public Guid ProposalId { get; private set; }
    public CfeoiStatus Status { get; private set; }

    private Cfeoi() { }

    public static Cfeoi Create(
        Guid id,
        string title,
        string description,
        CfeoiResourceType resourceType,
        Guid proposalId)
    {
        return new Cfeoi
        {
            Id = id,
            Title = title,
            Description = description,
            ResourceType = resourceType,
            ProposalId = proposalId,
            Status = CfeoiStatus.Open,
        };
    }

    public void Update(
        string title,
        string description,
        CfeoiResourceType resourceType)
    {
        Title = title;
        Description = description;
        ResourceType = resourceType;
    }

    public void TransitionStatus(CfeoiStatus newStatus)
    {
        if (!AllowedTransitions[Status].Contains(newStatus))
            throw new InvalidOperationException($"Cannot transition from {Status} to {newStatus}.");

        Status = newStatus;
    }
}
