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
    public string RoleTitle { get; private set; } = default!;
    public string Skills { get; private set; } = default!;
    public int Slots { get; private set; }
    public int? DurationWeeks { get; private set; }
    public string? Location { get; private set; }
    public string? Compensation { get; private set; }
    public DateOnly? Deadline { get; private set; }
    public string? ExternalLinks { get; private set; }

    private Cfeoi() { }

    public static Cfeoi Create(
        Guid id,
        string title,
        string description,
        CfeoiResourceType resourceType,
        Guid proposalId,
        string roleTitle,
        string skills,
        int slots,
        int? durationWeeks = null,
        string? location = null,
        string? compensation = null,
        DateOnly? deadline = null,
        string? externalLinks = null)
    {
        return new Cfeoi
        {
            Id = id,
            Title = title,
            Description = description,
            ResourceType = resourceType,
            ProposalId = proposalId,
            Status = CfeoiStatus.Open,
            RoleTitle = roleTitle,
            Skills = skills,
            Slots = slots,
            DurationWeeks = durationWeeks,
            Location = location,
            Compensation = compensation,
            Deadline = deadline,
            ExternalLinks = externalLinks
        };
    }

    public void Update(
        string title,
        string description,
        CfeoiResourceType resourceType,
        string roleTitle,
        string skills,
        int slots,
        int? durationWeeks = null,
        string? location = null,
        string? compensation = null,
        DateOnly? deadline = null,
        string? externalLinks = null)
    {
        Title = title;
        Description = description;
        ResourceType = resourceType;
        RoleTitle = roleTitle;
        Skills = skills;
        Slots = slots;
        DurationWeeks = durationWeeks;
        Location = location;
        Compensation = compensation;
        Deadline = deadline;
        ExternalLinks = externalLinks;
    }

    public void TransitionStatus(CfeoiStatus newStatus)
    {
        if (!AllowedTransitions[Status].Contains(newStatus))
            throw new InvalidOperationException($"Cannot transition from {Status} to {newStatus}.");

        Status = newStatus;
    }
}
