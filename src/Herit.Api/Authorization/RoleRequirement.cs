using Herit.Domain.Enums;
using Microsoft.AspNetCore.Authorization;

namespace Herit.Api.Authorization;

public class RoleRequirement(params UserRole[] roles) : IAuthorizationRequirement
{
    public IReadOnlyList<UserRole> AllowedRoles { get; } = roles;
}
