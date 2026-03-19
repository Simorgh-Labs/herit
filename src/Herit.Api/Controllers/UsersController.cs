using Herit.Application.Features.User.Commands.CreateStaffUser;
using Herit.Application.Features.User.Commands.CreateSubAdmin;
using Herit.Application.Features.User.Commands.DeleteStaffUser;
using Herit.Application.Features.User.Commands.DeleteSubAdmin;
using Herit.Application.Features.User.Commands.UpdateStaffUser;
using Herit.Application.Features.User.Queries.GetUserById;
using Herit.Application.Features.User.Queries.ListUsers;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Herit.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;

    public UsersController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct)
        => Ok(await _mediator.Send(new ListUsersQuery(), ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetUserByIdQuery(id), ct));

    [HttpPost("staff")]
    public async Task<IActionResult> CreateStaff([FromBody] CreateStaffUserCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPut("staff/{id:guid}")]
    public async Task<IActionResult> UpdateStaff(Guid id, [FromBody] UpdateStaffUserCommand command, CancellationToken ct)
    {
        await _mediator.Send(command with { Id = id }, ct);
        return NoContent();
    }

    [HttpDelete("staff/{id:guid}")]
    public async Task<IActionResult> DeleteStaff(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteStaffUserCommand(id), ct);
        return NoContent();
    }

    [HttpPost("sub-admins")]
    public async Task<IActionResult> CreateSubAdmin([FromBody] CreateSubAdminCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpDelete("sub-admins/{id:guid}")]
    public async Task<IActionResult> DeleteSubAdmin(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteSubAdminCommand(id), ct);
        return NoContent();
    }
}
