using Herit.Application.Interfaces;
using MediatR;

namespace Herit.Application.Features.Proposal.Commands.UpdateProposal;

public record UpdateProposalCommand(
    Guid Id,
    string Title,
    string ShortDescription,
    string LongDescription) : IRequest<Unit>;

public class UpdateProposalCommandHandler : IRequestHandler<UpdateProposalCommand, Unit>
{
    private readonly IProposalRepository _proposalRepository;

    public UpdateProposalCommandHandler(IProposalRepository proposalRepository)
    {
        _proposalRepository = proposalRepository;
    }

    public async Task<Unit> Handle(UpdateProposalCommand request, CancellationToken cancellationToken)
    {
        var proposal = await _proposalRepository.GetByIdAsync(request.Id, cancellationToken);
        if (proposal is null)
            throw new InvalidOperationException($"Proposal '{request.Id}' does not exist.");

        proposal.Update(request.Title, request.ShortDescription, request.LongDescription);
        await _proposalRepository.UpdateAsync(proposal, cancellationToken);
        return Unit.Value;
    }
}
