using Herit.Domain.Enums;

namespace Herit.Domain.Entities;

public class Rfp
{
    public Guid Id { get; private set; }
    public string Title { get; private set; } = default!;
    public string ShortDescription { get; private set; } = default!;
    public Guid AuthorId { get; private set; }
    public Guid OrganisationId { get; private set; }
    public string LongDescription { get; private set; } = default!;
    public RfpStatus Status { get; private set; }

    private Rfp() { }

    public static Rfp Create(Guid id, string title, string shortDescription, Guid authorId, Guid organisationId, string longDescription)
    {
        return new Rfp
        {
            Id = id,
            Title = title,
            ShortDescription = shortDescription,
            AuthorId = authorId,
            OrganisationId = organisationId,
            LongDescription = longDescription,
            Status = RfpStatus.Draft
        };
    }
}
