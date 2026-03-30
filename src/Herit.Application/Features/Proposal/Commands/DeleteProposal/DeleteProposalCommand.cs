using Herit.Application.Exceptions;
using Herit.Application.Interfaces;
using MediatR;

namespace Herit.Application.Features.Proposal.Commands.DeleteProposal;

public record DeleteProposalCommand(Guid Id) : IRequest<Unit>;

public class DeleteProposalCommandHandler : IRequestHandler<DeleteProposalCommand, Unit>
{
    private readonly IProposalRepository _proposalRepository;

    public DeleteProposalCommandHandler(IProposalRepository proposalRepository)
    {
        _proposalRepository = proposalRepository;
    }

    public async Task<Unit> Handle(DeleteProposalCommand request, CancellationToken cancellationToken)
    {
        var proposal = await _proposalRepository.GetByIdAsync(request.Id, cancellationToken);
        if (proposal is null)
            throw new NotFoundException($"Proposal '{request.Id}' does not exist.");

        await _proposalRepository.DeleteAsync(request.Id, cancellationToken);
        return Unit.Value;
    }
}
