using Herit.Application.Features.Rfp.Commands.CreateRfp;
using Herit.Application.Features.Rfp.Commands.DeleteRfp;
using Herit.Application.Features.Rfp.Commands.UpdateRfp;
using Herit.Application.Features.Rfp.Commands.UpdateRfpStatus;
using Herit.Application.Features.Rfp.Queries.GetRfpById;
using Herit.Application.Features.Rfp.Queries.ListRfps;
using Herit.Application.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Herit.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class RfpsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;

    public RfpsController(IMediator mediator, ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct)
        => Ok(await _mediator.Send(new ListRfpsQuery(), ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetRfpByIdQuery(id), ct));

    [HttpPost]
    [Authorize(Policy = "Staff")]
    public async Task<IActionResult> Create([FromBody] CreateRfpCommand command, CancellationToken ct)
    {
        var user = await _currentUserService.GetCurrentUserAsync(ct);
        var id = await _mediator.Send(command with { AuthorId = user.Id }, ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "Staff")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRfpCommand command, CancellationToken ct)
    {
        await _mediator.Send(command with { Id = id }, ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "Staff")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteRfpCommand(id), ct);
        return NoContent();
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Policy = "Staff")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateRfpStatusCommand command, CancellationToken ct)
    {
        await _mediator.Send(command with { Id = id }, ct);
        return NoContent();
    }
}
