using Herit.Domain.Enums;

namespace Herit.Domain.Entities;

public class User
{
    public Guid Id { get; private set; }
    public string Email { get; private set; } = default!;
    public string FullName { get; private set; } = default!;
    public UserRole Role { get; private set; }
    public Guid? OrganisationId { get; private set; }
    public string? Nationality { get; private set; }
    public string? Location { get; private set; }
    public string? ExpertiseTags { get; private set; }
    public DateTimeOffset? TermsAcceptedAt { get; private set; }

    private User() { }

    public static User Create(
        Guid id,
        string email,
        string fullName,
        UserRole role,
        Guid? organisationId = null,
        string? nationality = null,
        string? location = null,
        string? expertiseTags = null,
        DateTimeOffset? termsAcceptedAt = null)
    {
        return new User
        {
            Id = id,
            Email = email,
            FullName = fullName,
            Role = role,
            OrganisationId = organisationId,
            Nationality = nationality,
            Location = location,
            ExpertiseTags = expertiseTags,
            TermsAcceptedAt = termsAcceptedAt
        };
    }

    public void Update(string email, string fullName)
    {
        Email = email;
        FullName = fullName;
    }

    public void UpdateProfile(
        string? nationality = null,
        string? location = null,
        string? expertiseTags = null,
        DateTimeOffset? termsAcceptedAt = null)
    {
        Nationality = nationality;
        Location = location;
        ExpertiseTags = expertiseTags;
        TermsAcceptedAt = termsAcceptedAt;
    }
}
