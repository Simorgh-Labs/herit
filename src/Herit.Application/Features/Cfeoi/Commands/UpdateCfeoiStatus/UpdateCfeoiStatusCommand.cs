using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using MediatR;

namespace Herit.Application.Features.Cfeoi.Commands.UpdateCfeoiStatus;

public record UpdateCfeoiStatusCommand(Guid Id, CfeoiStatus NewStatus) : IRequest<Unit>;

public class UpdateCfeoiStatusCommandHandler : IRequestHandler<UpdateCfeoiStatusCommand, Unit>
{
    private readonly ICfeoiRepository _repository;

    public UpdateCfeoiStatusCommandHandler(ICfeoiRepository repository)
    {
        _repository = repository;
    }

    public async Task<Unit> Handle(UpdateCfeoiStatusCommand request, CancellationToken cancellationToken)
    {
        var cfeoi = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (cfeoi is null)
            throw new InvalidOperationException($"Cfeoi '{request.Id}' does not exist.");

        cfeoi.TransitionStatus(request.NewStatus);
        await _repository.UpdateAsync(cfeoi, cancellationToken);
        return Unit.Value;
    }
}
