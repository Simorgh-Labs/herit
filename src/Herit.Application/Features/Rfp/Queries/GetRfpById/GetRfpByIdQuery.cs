using Herit.Application.Exceptions;
using Herit.Application.Features.Rfp.Dtos;
using Herit.Application.Interfaces;
using MediatR;

namespace Herit.Application.Features.Rfp.Queries.GetRfpById;

public record GetRfpByIdQuery(Guid Id) : IRequest<RfpResponseDto>;

public class GetRfpByIdQueryHandler : IRequestHandler<GetRfpByIdQuery, RfpResponseDto>
{
    private readonly IRfpRepository _repository;
    private readonly IUserRepository _userRepository;
    private readonly IOrganisationRepository _organisationRepository;

    public GetRfpByIdQueryHandler(
        IRfpRepository repository,
        IUserRepository userRepository,
        IOrganisationRepository organisationRepository)
    {
        _repository = repository;
        _userRepository = userRepository;
        _organisationRepository = organisationRepository;
    }

    public async Task<RfpResponseDto> Handle(GetRfpByIdQuery request, CancellationToken cancellationToken)
    {
        var rfp = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (rfp is null)
            throw new NotFoundException($"Rfp '{request.Id}' was not found.");

        var author = await _userRepository.GetByIdAsync(rfp.AuthorId, cancellationToken);
        var organisation = await _organisationRepository.GetByIdAsync(rfp.OrganisationId, cancellationToken);

        return RfpResponseDto.From(rfp, author, organisation);
    }
}
