using Herit.Application.Authorization;
using Herit.Application.Exceptions;
using Herit.Application.Interfaces;
using MediatR;

namespace Herit.Application.Features.Eoi.Commands.WithdrawEoi;

public record WithdrawEoiCommand(Guid Id) : IRequest<Unit>;

public class WithdrawEoiCommandHandler : IRequestHandler<WithdrawEoiCommand, Unit>
{
    private readonly IEoiRepository _eoiRepository;
    private readonly ICurrentUserService _currentUserService;

    public WithdrawEoiCommandHandler(IEoiRepository eoiRepository, ICurrentUserService currentUserService)
    {
        _eoiRepository = eoiRepository;
        _currentUserService = currentUserService;
    }

    public async Task<Unit> Handle(WithdrawEoiCommand request, CancellationToken cancellationToken)
    {
        var eoi = await _eoiRepository.GetByIdAsync(request.Id, cancellationToken);
        if (eoi is null)
            throw new NotFoundException($"Eoi '{request.Id}' does not exist.");

        var user = await _currentUserService.GetCurrentUserAsync(cancellationToken);
        if (!MutationPolicy.CanMutateEoi(eoi, user))
            throw new ForbiddenException("Only the submitter of this EOI may withdraw it.");

        await _eoiRepository.DeleteAsync(request.Id, cancellationToken);
        return Unit.Value;
    }
}
