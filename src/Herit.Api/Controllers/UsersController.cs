using Herit.Application.Features.User.Commands.CreateOrganisationAdmin;
using Herit.Application.Features.User.Commands.CreateStaffUser;
using Herit.Application.Features.User.Commands.DeleteStaffUser;
using Herit.Application.Features.User.Commands.DeleteOrganisationAdmin;
using Herit.Application.Features.User.Commands.UpdateStaffUser;
using Herit.Application.Features.User.Commands.UpdateUserProfile;
using Herit.Application.Features.User.Queries.GetUserById;
using Herit.Application.Features.User.Queries.ListUsers;
using Herit.Application.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Herit.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;

    public UsersController(IMediator mediator, ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMe(CancellationToken ct)
        => Ok(await _currentUserService.GetCurrentUserAsync(ct));

    [HttpPatch("me/profile")]
    public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateUserProfileCommand command, CancellationToken ct)
    {
        var user = await _currentUserService.GetCurrentUserAsync(ct);
        await _mediator.Send(command with { Id = user.Id }, ct);
        return NoContent();
    }

    [HttpGet]
    [Authorize(Policy = "AdminOrSuperAdmin")]
    public async Task<IActionResult> List(CancellationToken ct)
        => Ok(await _mediator.Send(new ListUsersQuery(), ct));

    [HttpGet("{id:guid}")]
    [Authorize(Policy = "AdminOrSuperAdmin")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetUserByIdQuery(id), ct));

    [HttpPost("staff")]
    [Authorize(Policy = "AdminOrSuperAdmin")]
    public async Task<IActionResult> CreateStaff([FromBody] CreateStaffUserCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPut("staff/{id:guid}")]
    [Authorize(Policy = "AdminOrSuperAdmin")]
    public async Task<IActionResult> UpdateStaff(Guid id, [FromBody] UpdateStaffUserCommand command, CancellationToken ct)
    {
        await _mediator.Send(command with { Id = id }, ct);
        return NoContent();
    }

    [HttpDelete("staff/{id:guid}")]
    [Authorize(Policy = "AdminOrSuperAdmin")]
    public async Task<IActionResult> DeleteStaff(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteStaffUserCommand(id), ct);
        return NoContent();
    }

    [HttpPost("organisation-admins")]
    [Authorize(Policy = "AdminOrSuperAdmin")]
    public async Task<IActionResult> CreateOrganisationAdmin([FromBody] CreateOrganisationAdminCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpDelete("organisation-admins/{id:guid}")]
    [Authorize(Policy = "AdminOrSuperAdmin")]
    public async Task<IActionResult> DeleteOrganisationAdmin(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteOrganisationAdminCommand(id), ct);
        return NoContent();
    }

    [HttpPatch("{id:guid}/profile")]
    public async Task<IActionResult> UpdateProfile(Guid id, [FromBody] UpdateUserProfileCommand command, CancellationToken ct)
    {
        await _mediator.Send(command with { Id = id }, ct);
        return NoContent();
    }
}
