using Herit.Application.Features.Organisation.Commands.CreateDepartment;
using Herit.Application.Features.Organisation.Commands.DeleteDepartment;
using Herit.Application.Features.Organisation.Commands.UpdateDepartment;
using Herit.Application.Features.Organisation.Commands.UpdateOrganisation;
using Herit.Application.Features.Organisation.Queries.GetDepartmentById;
using Herit.Application.Features.Organisation.Queries.ListDepartments;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Herit.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class OrganisationController : ControllerBase
{
    private readonly IMediator _mediator;

    public OrganisationController(IMediator mediator) => _mediator = mediator;

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateOrganisation(Guid id, [FromBody] UpdateOrganisationCommand command, CancellationToken ct)
    {
        await _mediator.Send(command with { Id = id }, ct);
        return NoContent();
    }

    [HttpGet("departments")]
    public async Task<IActionResult> ListDepartments(CancellationToken ct)
        => Ok(await _mediator.Send(new ListDepartmentsQuery(), ct));

    [HttpGet("departments/{id:guid}")]
    public async Task<IActionResult> GetDepartmentById(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new GetDepartmentByIdQuery(id), ct));

    [HttpPost("departments")]
    public async Task<IActionResult> CreateDepartment([FromBody] CreateDepartmentCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetDepartmentById), new { id }, id);
    }

    [HttpPut("departments/{id:guid}")]
    public async Task<IActionResult> UpdateDepartment(Guid id, [FromBody] UpdateDepartmentCommand command, CancellationToken ct)
    {
        await _mediator.Send(command with { Id = id }, ct);
        return NoContent();
    }

    [HttpDelete("departments/{id:guid}")]
    public async Task<IActionResult> DeleteDepartment(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteDepartmentCommand(id), ct);
        return NoContent();
    }
}
