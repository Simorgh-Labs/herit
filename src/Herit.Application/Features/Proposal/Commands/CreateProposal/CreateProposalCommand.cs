using Herit.Application.Interfaces;
using MediatR;
using ProposalEntity = Herit.Domain.Entities.Proposal;

namespace Herit.Application.Features.Proposal.Commands.CreateProposal;

public record CreateProposalCommand(
    string Title,
    string ShortDescription,
    Guid AuthorId,
    Guid OrganisationId,
    string LongDescription,
    Guid? RfpId = null) : IRequest<Guid>;

public class CreateProposalCommandHandler : IRequestHandler<CreateProposalCommand, Guid>
{
    private readonly IProposalRepository _proposalRepository;
    private readonly IUserRepository _userRepository;
    private readonly IOrganisationRepository _organisationRepository;
    private readonly IRfpRepository _rfpRepository;

    public CreateProposalCommandHandler(
        IProposalRepository proposalRepository,
        IUserRepository userRepository,
        IOrganisationRepository organisationRepository,
        IRfpRepository rfpRepository)
    {
        _proposalRepository = proposalRepository;
        _userRepository = userRepository;
        _organisationRepository = organisationRepository;
        _rfpRepository = rfpRepository;
    }

    public async Task<Guid> Handle(CreateProposalCommand request, CancellationToken cancellationToken)
    {
        var author = await _userRepository.GetByIdAsync(request.AuthorId, cancellationToken);
        if (author is null)
            throw new InvalidOperationException($"User '{request.AuthorId}' does not exist.");

        var organisation = await _organisationRepository.GetByIdAsync(request.OrganisationId, cancellationToken);
        if (organisation is null)
            throw new InvalidOperationException($"Organisation '{request.OrganisationId}' does not exist.");

        if (request.RfpId is not null)
        {
            var rfp = await _rfpRepository.GetByIdAsync(request.RfpId.Value, cancellationToken);
            if (rfp is null)
                throw new InvalidOperationException($"Rfp '{request.RfpId}' does not exist.");
        }

        var id = Guid.NewGuid();
        var proposal = ProposalEntity.Create(id, request.Title, request.ShortDescription, request.AuthorId, request.OrganisationId, request.LongDescription, request.RfpId);
        await _proposalRepository.AddAsync(proposal, cancellationToken);
        return id;
    }
}
