using Herit.Domain.Enums;

namespace Herit.Domain.Entities;

public class Cfeoi
{
    public Guid Id { get; private set; }
    public string Title { get; private set; } = default!;
    public string Description { get; private set; } = default!;
    public CfeoiResourceType ResourceType { get; private set; }
    public Guid ProposalId { get; private set; }
    public CfeoiStatus Status { get; private set; }

    private Cfeoi() { }

    public static Cfeoi Create(Guid id, string title, string description, CfeoiResourceType resourceType, Guid proposalId)
    {
        return new Cfeoi
        {
            Id = id,
            Title = title,
            Description = description,
            ResourceType = resourceType,
            ProposalId = proposalId,
            Status = CfeoiStatus.Open
        };
    }
}
