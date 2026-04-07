using Herit.Application.Features.Eoi.Commands.DeleteEoi;
using Herit.Application.Features.Eoi.Commands.SetEoiVisibility;
using Herit.Application.Features.Eoi.Commands.SubmitEoi;
using Herit.Application.Features.Eoi.Commands.UpdateEoiStatus;
using Herit.Application.Features.Eoi.Commands.WithdrawEoi;
using Herit.Application.Features.Eoi.Queries.GetEoiById;
using Herit.Application.Features.Eoi.Queries.ListEoisByCfeoi;
using Herit.Application.Features.Eoi.Queries.ListEoisByUser;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Herit.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class EoiController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;

    public EoiController(IMediator mediator, ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    [Authorize(Policy = "StaffOrExpat")]
    public async Task<IActionResult> ListByCfeoi([FromQuery] Guid cfeoiId, CancellationToken ct)
        => Ok(await _mediator.Send(new ListEoisByCfeoiQuery(cfeoiId), ct));

    [HttpGet("my")]
    [Authorize(Policy = "Expat")]
    public async Task<IActionResult> ListMyEois(CancellationToken ct)
    {
        var user = await _currentUserService.GetCurrentUserAsync(ct);
        return Ok(await _mediator.Send(new ListEoisByUserQuery(user.Id), ct));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetEoiByIdQuery(id), ct));

    [HttpPost]
    [Authorize(Policy = "Expat")]
    public async Task<IActionResult> Submit([FromBody] SubmitEoiCommand command, CancellationToken ct)
    {
        var user = await _currentUserService.GetCurrentUserAsync(ct);
        var id = await _mediator.Send(command with { SubmittedById = user.Id }, ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "Staff")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteEoiCommand(id), ct);
        return NoContent();
    }

    [HttpPatch("{id:guid}/withdraw")]
    [Authorize(Policy = "Expat")]
    public async Task<IActionResult> Withdraw(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new WithdrawEoiCommand(id), ct);
        return NoContent();
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Policy = "Staff")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateEoiStatusCommand command, CancellationToken ct)
    {
        await _mediator.Send(command with { Id = id }, ct);
        return NoContent();
    }

    [HttpPatch("{id:guid}/visibility")]
    [Authorize(Policy = "Expat")]
    public async Task<IActionResult> SetVisibility(Guid id, [FromBody] EoiVisibility visibility, CancellationToken ct)
    {
        await _mediator.Send(new SetEoiVisibilityCommand(id, visibility), ct);
        return NoContent();
    }
}
