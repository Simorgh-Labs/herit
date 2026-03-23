using Herit.Domain.Enums;

namespace Herit.Domain.Entities;

public class Proposal
{
    public Guid Id { get; private set; }
    public string Title { get; private set; } = default!;
    public string ShortDescription { get; private set; } = default!;
    public Guid AuthorId { get; private set; }
    public Guid OrganisationId { get; private set; }
    public string LongDescription { get; private set; } = default!;
    public ProposalStatus Status { get; private set; }
    public ProposalVisibility Visibility { get; private set; }
    public Guid? RfpId { get; private set; }

    private Proposal() { }

    public static Proposal Create(Guid id, string title, string shortDescription, Guid authorId, Guid organisationId, string longDescription, Guid? rfpId = null)
    {
        return new Proposal
        {
            Id = id,
            Title = title,
            ShortDescription = shortDescription,
            AuthorId = authorId,
            OrganisationId = organisationId,
            LongDescription = longDescription,
            Status = ProposalStatus.Ideation,
            Visibility = ProposalVisibility.Private,
            RfpId = rfpId
        };
    }
}
