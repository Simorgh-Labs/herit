using Herit.Application.Exceptions;
using Herit.Application.Interfaces;
using MediatR;
using RfpEntity = Herit.Domain.Entities.Rfp;

namespace Herit.Application.Features.Rfp.Commands.CreateRfp;

public record CreateRfpCommand(
    string Title,
    string ShortDescription,
    Guid OrganisationId,
    string LongDescription,
    string? Tags = null) : IRequest<Guid>
{
    public Guid AuthorId { get; init; }
}

public class CreateRfpCommandHandler : IRequestHandler<CreateRfpCommand, Guid>
{
    private readonly IRfpRepository _rfpRepository;
    private readonly IUserRepository _userRepository;
    private readonly IOrganisationRepository _organisationRepository;

    public CreateRfpCommandHandler(
        IRfpRepository rfpRepository,
        IUserRepository userRepository,
        IOrganisationRepository organisationRepository)
    {
        _rfpRepository = rfpRepository;
        _userRepository = userRepository;
        _organisationRepository = organisationRepository;
    }

    public async Task<Guid> Handle(CreateRfpCommand request, CancellationToken cancellationToken)
    {
        var author = await _userRepository.GetByIdAsync(request.AuthorId, cancellationToken);
        if (author is null)
            throw new NotFoundException($"User '{request.AuthorId}' does not exist.");

        var organisation = await _organisationRepository.GetByIdAsync(request.OrganisationId, cancellationToken);
        if (organisation is null)
            throw new NotFoundException($"Organisation '{request.OrganisationId}' does not exist.");

        var id = Guid.NewGuid();
        var rfp = RfpEntity.Create(id, request.Title, request.ShortDescription, request.AuthorId, request.OrganisationId, request.LongDescription, request.Tags);
        await _rfpRepository.AddAsync(rfp, cancellationToken);
        return id;
    }
}
