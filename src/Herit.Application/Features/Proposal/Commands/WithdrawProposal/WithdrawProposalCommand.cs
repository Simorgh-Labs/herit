using Herit.Application.Exceptions;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using MediatR;

namespace Herit.Application.Features.Proposal.Commands.WithdrawProposal;

public record WithdrawProposalCommand(Guid Id) : IRequest<Unit>;

public class WithdrawProposalCommandHandler : IRequestHandler<WithdrawProposalCommand, Unit>
{
    private readonly IProposalRepository _proposalRepository;

    public WithdrawProposalCommandHandler(IProposalRepository proposalRepository)
    {
        _proposalRepository = proposalRepository;
    }

    public async Task<Unit> Handle(WithdrawProposalCommand request, CancellationToken cancellationToken)
    {
        var proposal = await _proposalRepository.GetByIdAsync(request.Id, cancellationToken);
        if (proposal is null)
            throw new NotFoundException($"Proposal '{request.Id}' does not exist.");

        proposal.TransitionStatus(ProposalStatus.Withdrawn);
        await _proposalRepository.UpdateAsync(proposal, cancellationToken);
        return Unit.Value;
    }
}
