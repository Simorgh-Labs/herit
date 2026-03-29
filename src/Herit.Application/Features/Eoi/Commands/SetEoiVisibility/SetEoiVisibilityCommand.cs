using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using MediatR;

namespace Herit.Application.Features.Eoi.Commands.SetEoiVisibility;

public record SetEoiVisibilityCommand(Guid Id, EoiVisibility Visibility) : IRequest<Unit>;

public class SetEoiVisibilityCommandHandler : IRequestHandler<SetEoiVisibilityCommand, Unit>
{
    private readonly IEoiRepository _eoiRepository;

    public SetEoiVisibilityCommandHandler(IEoiRepository eoiRepository)
    {
        _eoiRepository = eoiRepository;
    }

    public async Task<Unit> Handle(SetEoiVisibilityCommand request, CancellationToken cancellationToken)
    {
        var eoi = await _eoiRepository.GetByIdAsync(request.Id, cancellationToken);
        if (eoi is null)
            throw new InvalidOperationException($"Eoi '{request.Id}' does not exist.");

        eoi.SetVisibility(request.Visibility);
        await _eoiRepository.UpdateAsync(eoi, cancellationToken);
        return Unit.Value;
    }
}
