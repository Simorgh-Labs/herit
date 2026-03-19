using Herit.Domain.Enums;

namespace Herit.Domain.Entities;

public class User
{
    public Guid Id { get; private set; }
    public string Email { get; private set; } = default!;
    public string FullName { get; private set; } = default!;
    public UserRole Role { get; private set; }

    private User() { }

    public static User Create(Guid id, string email, string fullName, UserRole role)
    {
        return new User
        {
            Id = id,
            Email = email,
            FullName = fullName,
            Role = role
        };
    }
}
