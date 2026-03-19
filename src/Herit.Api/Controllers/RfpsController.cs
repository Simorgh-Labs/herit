using Herit.Application.Features.Rfp.Commands.CreateRfp;
using Herit.Application.Features.Rfp.Commands.DeleteRfp;
using Herit.Application.Features.Rfp.Commands.PublishRfp;
using Herit.Application.Features.Rfp.Commands.UpdateRfp;
using Herit.Application.Features.Rfp.Queries.GetRfpById;
using Herit.Application.Features.Rfp.Queries.ListRfps;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Herit.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class RfpsController : ControllerBase
{
    private readonly IMediator _mediator;

    public RfpsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct)
        => Ok(await _mediator.Send(new ListRfpsQuery(), ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetRfpByIdQuery(id), ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateRfpCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRfpCommand command, CancellationToken ct)
    {
        await _mediator.Send(command with { Id = id }, ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteRfpCommand(id), ct);
        return NoContent();
    }

    [HttpPatch("{id:guid}/publish")]
    public async Task<IActionResult> Publish(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new PublishRfpCommand(id), ct);
        return NoContent();
    }
}
