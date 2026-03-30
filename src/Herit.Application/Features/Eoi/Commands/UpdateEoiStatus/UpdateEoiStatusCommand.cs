using Herit.Application.Exceptions;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using MediatR;

namespace Herit.Application.Features.Eoi.Commands.UpdateEoiStatus;

public record UpdateEoiStatusCommand(Guid Id, EoiStatus NewStatus) : IRequest<Unit>;

public class UpdateEoiStatusCommandHandler : IRequestHandler<UpdateEoiStatusCommand, Unit>
{
    private readonly IEoiRepository _repository;

    public UpdateEoiStatusCommandHandler(IEoiRepository repository)
    {
        _repository = repository;
    }

    public async Task<Unit> Handle(UpdateEoiStatusCommand request, CancellationToken cancellationToken)
    {
        var eoi = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (eoi is null)
            throw new NotFoundException($"Eoi '{request.Id}' does not exist.");

        eoi.TransitionStatus(request.NewStatus);
        await _repository.UpdateAsync(eoi, cancellationToken);
        return Unit.Value;
    }
}
