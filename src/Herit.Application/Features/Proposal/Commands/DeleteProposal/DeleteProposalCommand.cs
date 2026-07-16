using Herit.Application.Authorization;
using Herit.Application.Exceptions;
using Herit.Application.Interfaces;
using MediatR;

namespace Herit.Application.Features.Proposal.Commands.DeleteProposal;

public record DeleteProposalCommand(Guid Id) : IRequest<Unit>;

public class DeleteProposalCommandHandler : IRequestHandler<DeleteProposalCommand, Unit>
{
    private readonly IProposalRepository _proposalRepository;
    private readonly ICurrentUserService _currentUserService;

    public DeleteProposalCommandHandler(IProposalRepository proposalRepository, ICurrentUserService currentUserService)
    {
        _proposalRepository = proposalRepository;
        _currentUserService = currentUserService;
    }

    public async Task<Unit> Handle(DeleteProposalCommand request, CancellationToken cancellationToken)
    {
        var proposal = await _proposalRepository.GetByIdAsync(request.Id, cancellationToken);
        if (proposal is null)
            throw new NotFoundException($"Proposal '{request.Id}' does not exist.");

        var user = await _currentUserService.GetCurrentUserAsync(cancellationToken);
        if (!MutationPolicy.CanDeleteProposal(proposal, user))
            throw new ForbiddenException("Only the owner of this proposal, or staff, may delete it.");

        await _proposalRepository.DeleteAsync(request.Id, cancellationToken);
        return Unit.Value;
    }
}
