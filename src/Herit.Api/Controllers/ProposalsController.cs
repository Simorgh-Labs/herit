using Herit.Application.Features.Proposal.Commands.ApproveProposal;
using Herit.Application.Features.Proposal.Commands.CreateProposal;
using Herit.Application.Features.Proposal.Commands.DeleteProposal;
using Herit.Application.Features.Proposal.Commands.ReviewProposal;
using Herit.Application.Features.Proposal.Commands.SetProposalVisibility;
using Herit.Application.Features.Proposal.Commands.SubmitProposal;
using Herit.Application.Features.Proposal.Commands.UpdateProposal;
using Herit.Application.Features.Proposal.Commands.WithdrawProposal;
using Herit.Application.Features.Proposal.Queries.GetProposalById;
using Herit.Application.Features.Proposal.Queries.ListProposals;
using Herit.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Herit.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class ProposalsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProposalsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct)
        => Ok(await _mediator.Send(new ListProposalsQuery(), ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetProposalByIdQuery(id), ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProposalCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProposalCommand command, CancellationToken ct)
    {
        await _mediator.Send(command with { Id = id }, ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteProposalCommand(id), ct);
        return NoContent();
    }

    [HttpPatch("{id:guid}/submit")]
    public async Task<IActionResult> Submit(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new SubmitProposalCommand(id), ct);
        return NoContent();
    }

    [HttpPatch("{id:guid}/approve")]
    public async Task<IActionResult> Approve(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new ApproveProposalCommand(id), ct);
        return NoContent();
    }

    [HttpPatch("{id:guid}/review")]
    public async Task<IActionResult> Review(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new ReviewProposalCommand(id), ct);
        return NoContent();
    }

    [HttpPatch("{id:guid}/withdraw")]
    public async Task<IActionResult> Withdraw(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new WithdrawProposalCommand(id), ct);
        return NoContent();
    }

    [HttpPatch("{id:guid}/visibility")]
    public async Task<IActionResult> SetVisibility(Guid id, [FromBody] ProposalVisibility visibility, CancellationToken ct)
    {
        await _mediator.Send(new SetProposalVisibilityCommand(id, visibility), ct);
        return NoContent();
    }
}
