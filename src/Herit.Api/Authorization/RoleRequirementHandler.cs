using Herit.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace Herit.Api.Authorization;

public class RoleRequirementHandler(ICurrentUserService currentUserService)
    : AuthorizationHandler<RoleRequirement>
{
    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        RoleRequirement requirement)
    {
        if (context.User.Identity?.IsAuthenticated != true)
        {
            context.Fail();
            return;
        }

        try
        {
            var user = await currentUserService.GetCurrentUserAsync();
            if (requirement.AllowedRoles.Contains(user.Role))
                context.Succeed(requirement);
        }
        catch
        {
            context.Fail();
        }
    }
}
