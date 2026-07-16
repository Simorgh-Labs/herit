using Herit.Application.Authorization;
using Herit.Application.Exceptions;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using MediatR;

namespace Herit.Application.Features.Eoi.Commands.SetEoiVisibility;

public record SetEoiVisibilityCommand(Guid Id, EoiVisibility Visibility) : IRequest<Unit>;

public class SetEoiVisibilityCommandHandler : IRequestHandler<SetEoiVisibilityCommand, Unit>
{
    private readonly IEoiRepository _eoiRepository;
    private readonly ICurrentUserService _currentUserService;

    public SetEoiVisibilityCommandHandler(IEoiRepository eoiRepository, ICurrentUserService currentUserService)
    {
        _eoiRepository = eoiRepository;
        _currentUserService = currentUserService;
    }

    public async Task<Unit> Handle(SetEoiVisibilityCommand request, CancellationToken cancellationToken)
    {
        var eoi = await _eoiRepository.GetByIdAsync(request.Id, cancellationToken);
        if (eoi is null)
            throw new NotFoundException($"Eoi '{request.Id}' does not exist.");

        var user = await _currentUserService.GetCurrentUserAsync(cancellationToken);
        if (!MutationPolicy.CanMutateEoi(eoi, user))
            throw new ForbiddenException("Only the submitter of this EOI may change its visibility.");

        eoi.SetVisibility(request.Visibility);
        await _eoiRepository.UpdateAsync(eoi, cancellationToken);
        return Unit.Value;
    }
}
