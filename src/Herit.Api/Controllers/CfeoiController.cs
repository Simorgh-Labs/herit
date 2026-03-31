using Herit.Application.Features.Cfeoi.Commands.PublishCfeoi;
using Herit.Application.Features.Cfeoi.Commands.UpdateCfeoiStatus;
using Herit.Application.Features.Cfeoi.Queries.GetCfeoiById;
using Herit.Application.Features.Cfeoi.Queries.ListCfeois;
using Herit.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Herit.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class CfeoiController : ControllerBase
{
    private readonly IMediator _mediator;

    public CfeoiController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] CfeoiStatus? status, [FromQuery] Guid? proposalId, CancellationToken ct)
        => Ok(await _mediator.Send(new ListCfeoisQuery(status, proposalId), ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetCfeoiByIdQuery(id), ct));

    [HttpPost]
    public async Task<IActionResult> Publish([FromBody] PublishCfeoiCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateCfeoiStatusCommand command, CancellationToken ct)
    {
        await _mediator.Send(command with { Id = id }, ct);
        return NoContent();
    }
}
