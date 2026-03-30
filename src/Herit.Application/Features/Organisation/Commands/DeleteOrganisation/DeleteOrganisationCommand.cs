using Herit.Application.Exceptions;
using Herit.Application.Interfaces;
using MediatR;

namespace Herit.Application.Features.Organisation.Commands.DeleteOrganisation;

public record DeleteOrganisationCommand(Guid Id) : IRequest<Unit>;

public class DeleteOrganisationCommandHandler : IRequestHandler<DeleteOrganisationCommand, Unit>
{
    private readonly IOrganisationRepository _repository;

    public DeleteOrganisationCommandHandler(IOrganisationRepository repository)
    {
        _repository = repository;
    }

    public async Task<Unit> Handle(DeleteOrganisationCommand request, CancellationToken cancellationToken)
    {
        var organisation = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (organisation is null)
            throw new NotFoundException($"Organisation '{request.Id}' does not exist.");

        await _repository.DeleteAsync(request.Id, cancellationToken);
        return Unit.Value;
    }
}
