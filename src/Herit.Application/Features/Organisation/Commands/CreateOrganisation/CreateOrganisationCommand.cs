using Herit.Application.Interfaces;
using MediatR;
using DomainEntities = Herit.Domain.Entities;

namespace Herit.Application.Features.Organisation.Commands.CreateOrganisation;

public record CreateOrganisationCommand(string Name, Guid? ParentId = null) : IRequest<Guid>;

public class CreateOrganisationCommandHandler : IRequestHandler<CreateOrganisationCommand, Guid>
{
    private readonly IOrganisationRepository _repository;

    public CreateOrganisationCommandHandler(IOrganisationRepository repository)
    {
        _repository = repository;
    }

    public async Task<Guid> Handle(CreateOrganisationCommand request, CancellationToken cancellationToken)
    {
        if (request.ParentId is { } parentId)
        {
            var parent = await _repository.GetByIdAsync(parentId, cancellationToken);
            if (parent is null)
                throw new InvalidOperationException($"Parent organisation '{parentId}' does not exist.");
        }

        var id = Guid.NewGuid();
        var organisation = DomainEntities.Organisation.Create(id, request.Name, request.ParentId);
        await _repository.AddAsync(organisation, cancellationToken);
        return id;
    }
}
