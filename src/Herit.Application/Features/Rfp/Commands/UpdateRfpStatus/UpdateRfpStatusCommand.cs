using Herit.Application.Exceptions;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using MediatR;

namespace Herit.Application.Features.Rfp.Commands.UpdateRfpStatus;

public record UpdateRfpStatusCommand(Guid Id, RfpStatus NewStatus) : IRequest<Unit>;

public class UpdateRfpStatusCommandHandler : IRequestHandler<UpdateRfpStatusCommand, Unit>
{
    private readonly IRfpRepository _repository;

    public UpdateRfpStatusCommandHandler(IRfpRepository repository)
    {
        _repository = repository;
    }

    public async Task<Unit> Handle(UpdateRfpStatusCommand request, CancellationToken cancellationToken)
    {
        var rfp = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (rfp is null)
            throw new NotFoundException($"Rfp '{request.Id}' does not exist.");

        rfp.TransitionStatus(request.NewStatus);
        await _repository.UpdateAsync(rfp, cancellationToken);
        return Unit.Value;
    }
}
