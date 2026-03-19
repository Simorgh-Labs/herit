using Herit.Application.Features.Cfeoi.Commands.CloseCfeoi;
using Herit.Application.Features.Cfeoi.Commands.PublishCfeoi;
using Herit.Application.Features.Cfeoi.Queries.GetCfeoiById;
using Herit.Application.Features.Cfeoi.Queries.ListCfeoisByProposal;
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
    public async Task<IActionResult> ListByProposal([FromQuery] Guid proposalId, CancellationToken ct)
        => Ok(await _mediator.Send(new ListCfeoisByProposalQuery(proposalId), ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetCfeoiByIdQuery(id), ct));

    [HttpPost]
    public async Task<IActionResult> Publish([FromBody] PublishCfeoiCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPatch("{id:guid}/close")]
    public async Task<IActionResult> Close(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new CloseCfeoiCommand(id), ct);
        return NoContent();
    }
}
