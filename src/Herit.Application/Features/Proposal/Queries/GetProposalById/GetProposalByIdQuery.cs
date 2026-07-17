using Herit.Application.Exceptions;
using Herit.Application.Features.Proposal.Dtos;
using Herit.Application.Interfaces;
using MediatR;

namespace Herit.Application.Features.Proposal.Queries.GetProposalById;

public record GetProposalByIdQuery(Guid Id) : IRequest<ProposalResponseDto>;

public class GetProposalByIdQueryHandler : IRequestHandler<GetProposalByIdQuery, ProposalResponseDto>
{
    private readonly IProposalRepository _proposalRepository;
    private readonly IUserRepository _userRepository;
    private readonly IOrganisationRepository _organisationRepository;

    public GetProposalByIdQueryHandler(
        IProposalRepository proposalRepository,
        IUserRepository userRepository,
        IOrganisationRepository organisationRepository)
    {
        _proposalRepository = proposalRepository;
        _userRepository = userRepository;
        _organisationRepository = organisationRepository;
    }

    public async Task<ProposalResponseDto> Handle(GetProposalByIdQuery request, CancellationToken cancellationToken)
    {
        var proposal = await _proposalRepository.GetByIdAsync(request.Id, cancellationToken);
        if (proposal is null)
            throw new NotFoundException($"Proposal '{request.Id}' was not found.");

        var author = await _userRepository.GetByIdAsync(proposal.AuthorId, cancellationToken);
        var organisation = await _organisationRepository.GetByIdAsync(proposal.OrganisationId, cancellationToken);

        return ProposalResponseDto.From(proposal, author, organisation);
    }
}
