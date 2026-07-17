using Herit.Application.Exceptions;
using Herit.Application.Interfaces;
using MediatR;

namespace Herit.Application.Features.Organisation.Commands.DeleteOrganisation;

public record DeleteOrganisationCommand(Guid Id) : IRequest<Unit>;

public class DeleteOrganisationCommandHandler : IRequestHandler<DeleteOrganisationCommand, Unit>
{
    private readonly IOrganisationRepository _repository;
    private readonly IUserRepository _userRepository;
    private readonly IRfpRepository _rfpRepository;
    private readonly IProposalRepository _proposalRepository;

    public DeleteOrganisationCommandHandler(
        IOrganisationRepository repository,
        IUserRepository userRepository,
        IRfpRepository rfpRepository,
        IProposalRepository proposalRepository)
    {
        _repository = repository;
        _userRepository = userRepository;
        _rfpRepository = rfpRepository;
        _proposalRepository = proposalRepository;
    }

    public async Task<Unit> Handle(DeleteOrganisationCommand request, CancellationToken cancellationToken)
    {
        var organisation = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (organisation is null)
            throw new NotFoundException($"Organisation '{request.Id}' does not exist.");

        await EnsureNoAttachedRecordsAsync(request.Id, cancellationToken);

        await _repository.DeleteAsync(request.Id, cancellationToken);
        return Unit.Value;
    }

    private async Task EnsureNoAttachedRecordsAsync(Guid organisationId, CancellationToken cancellationToken)
    {
        var users = await _userRepository.ListAsync(cancellationToken);
        if (users.Any(u => u.OrganisationId == organisationId))
            throw new ConflictException($"Organisation '{organisationId}' still has attached users and cannot be deleted.");

        var organisations = await _repository.ListAsync(cancellationToken);
        if (organisations.Any(o => o.ParentId == organisationId))
            throw new ConflictException($"Organisation '{organisationId}' still has child organisations and cannot be deleted.");

        var rfps = await _rfpRepository.ListAsync(cancellationToken);
        if (rfps.Any(r => r.OrganisationId == organisationId))
            throw new ConflictException($"Organisation '{organisationId}' still has attached RFPs and cannot be deleted.");

        var proposals = await _proposalRepository.ListAsync(cancellationToken);
        if (proposals.Any(p => p.OrganisationId == organisationId))
            throw new ConflictException($"Organisation '{organisationId}' still has attached proposals and cannot be deleted.");
    }
}
