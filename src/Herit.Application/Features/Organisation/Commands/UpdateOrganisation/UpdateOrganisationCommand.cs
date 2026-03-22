using Herit.Application.Interfaces;
using MediatR;

namespace Herit.Application.Features.Organisation.Commands.UpdateOrganisation;

public record UpdateOrganisationCommand(Guid Id, string Name) : IRequest<Unit>;

public class UpdateOrganisationCommandHandler : IRequestHandler<UpdateOrganisationCommand, Unit>
{
    private readonly IOrganisationRepository _repository;

    public UpdateOrganisationCommandHandler(IOrganisationRepository repository)
    {
        _repository = repository;
    }

    public async Task<Unit> Handle(UpdateOrganisationCommand request, CancellationToken cancellationToken)
    {
        var organisation = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (organisation is null)
            throw new InvalidOperationException($"Organisation '{request.Id}' does not exist.");

        organisation.Update(request.Name);
        await _repository.UpdateAsync(organisation, cancellationToken);
        return Unit.Value;
    }
}
