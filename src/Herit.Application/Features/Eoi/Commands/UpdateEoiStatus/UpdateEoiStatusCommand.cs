using Herit.Application.Authorization;
using Herit.Application.Exceptions;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using MediatR;

namespace Herit.Application.Features.Eoi.Commands.UpdateEoiStatus;

public record UpdateEoiStatusCommand(Guid Id, EoiStatus NewStatus) : IRequest<Unit>;

public class UpdateEoiStatusCommandHandler : IRequestHandler<UpdateEoiStatusCommand, Unit>
{
    private readonly IEoiRepository _repository;
    private readonly ICfeoiRepository _cfeoiRepository;
    private readonly IProposalRepository _proposalRepository;
    private readonly ICurrentUserService _currentUserService;

    public UpdateEoiStatusCommandHandler(
        IEoiRepository repository,
        ICfeoiRepository cfeoiRepository,
        IProposalRepository proposalRepository,
        ICurrentUserService currentUserService)
    {
        _repository = repository;
        _cfeoiRepository = cfeoiRepository;
        _proposalRepository = proposalRepository;
        _currentUserService = currentUserService;
    }

    public async Task<Unit> Handle(UpdateEoiStatusCommand request, CancellationToken cancellationToken)
    {
        var eoi = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (eoi is null)
            throw new NotFoundException($"Eoi '{request.Id}' does not exist.");

        // Staff may review any EOI; an expat may only review EOIs on CFEOIs that
        // belong to a proposal they own (flow 3d).
        var user = await _currentUserService.GetCurrentUserAsync(cancellationToken);
        if (!VisibilityPolicy.IsStaff(user))
        {
            var cfeoi = await _cfeoiRepository.GetByIdAsync(eoi.CfeoiId, cancellationToken);
            var proposal = cfeoi is null
                ? null
                : await _proposalRepository.GetByIdAsync(cfeoi.ProposalId, cancellationToken);

            if (proposal is null || proposal.AuthorId != user.Id)
                throw new ForbiddenException("Only the owner of the parent proposal may update the status of this EOI.");
        }

        eoi.TransitionStatus(request.NewStatus);
        await _repository.UpdateAsync(eoi, cancellationToken);
        return Unit.Value;
    }
}
