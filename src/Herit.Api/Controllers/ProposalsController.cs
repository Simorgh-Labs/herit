using Herit.Application.Features.Proposal.Commands.CreateProposal;
using Herit.Application.Features.Proposal.Commands.DeleteProposal;
using Herit.Application.Features.Proposal.Commands.SetProposalVisibility;
using Herit.Application.Features.Proposal.Commands.UpdateProposal;
using Herit.Application.Features.Proposal.Commands.UpdateProposalStatus;
using Herit.Application.Features.Proposal.Queries.GetProposalById;
using Herit.Application.Features.Proposal.Queries.ListProposals;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Herit.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class ProposalsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;

    public ProposalsController(IMediator mediator, ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> List(CancellationToken ct)
        => Ok(await _mediator.Send(new ListProposalsQuery(), ct));

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetProposalByIdQuery(id), ct));

    [HttpPost]
    [Authorize(Policy = "Expat")]
    public async Task<IActionResult> Create([FromBody] CreateProposalCommand command, CancellationToken ct)
    {
        var user = await _currentUserService.GetCurrentUserAsync(ct);
        var id = await _mediator.Send(command with { AuthorId = user.Id }, ct);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "Expat")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProposalCommand command, CancellationToken ct)
    {
        await _mediator.Send(command with { Id = id }, ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "StaffOrExpat")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteProposalCommand(id), ct);
        return NoContent();
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Policy = "StaffOrExpat")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] ProposalStatus newStatus, CancellationToken ct)
    {
        await _mediator.Send(new UpdateProposalStatusCommand(id, newStatus), ct);
        return NoContent();
    }

    [HttpPatch("{id:guid}/visibility")]
    [Authorize(Policy = "Expat")]
    public async Task<IActionResult> SetVisibility(Guid id, [FromBody] ProposalVisibility visibility, CancellationToken ct)
    {
        await _mediator.Send(new SetProposalVisibilityCommand(id, visibility), ct);
        return NoContent();
    }
}
