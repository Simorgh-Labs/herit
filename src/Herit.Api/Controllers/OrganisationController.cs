using Herit.Application.Features.Organisation.Commands.CreateOrganisation;
using Herit.Application.Features.Organisation.Commands.DeleteOrganisation;
using Herit.Application.Features.Organisation.Commands.UpdateOrganisation;
using Herit.Application.Features.Organisation.Queries.GetOrganisationById;
using Herit.Application.Features.Organisation.Queries.ListOrganisations;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Herit.Api.Controllers;

[ApiController]
[Route("api/v1/Organisations")]
[Authorize]
public class OrganisationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public OrganisationsController(IMediator mediator) => _mediator = mediator;

    [HttpPost]
    [Authorize(Policy = "AdminOrSuperAdmin")]
    public async Task<IActionResult> CreateOrganisation([FromBody] CreateOrganisationCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetOrganisationById), new { id }, id);
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> ListOrganisations(CancellationToken ct)
        => Ok(await _mediator.Send(new ListOrganisationsQuery(), ct));

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetOrganisationById(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetOrganisationByIdQuery(id), ct));

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "AdminOrSuperAdmin")]
    public async Task<IActionResult> UpdateOrganisation(Guid id, [FromBody] UpdateOrganisationCommand command, CancellationToken ct)
    {
        await _mediator.Send(command with { Id = id }, ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "AdminOrSuperAdmin")]
    public async Task<IActionResult> DeleteOrganisation(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteOrganisationCommand(id), ct);
        return NoContent();
    }
}
