using Herit.Application.Interfaces;
using MediatR;

namespace Herit.Application.Features.Rfp.Commands.UpdateRfp;

public record UpdateRfpCommand(
    Guid Id,
    string Title,
    string ShortDescription,
    string LongDescription) : IRequest<Unit>;

public class UpdateRfpCommandHandler : IRequestHandler<UpdateRfpCommand, Unit>
{
    private readonly IRfpRepository _repository;

    public UpdateRfpCommandHandler(IRfpRepository repository)
    {
        _repository = repository;
    }

    public async Task<Unit> Handle(UpdateRfpCommand request, CancellationToken cancellationToken)
    {
        var rfp = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (rfp is null)
            throw new InvalidOperationException($"Rfp '{request.Id}' does not exist.");

        rfp.Update(request.Title, request.ShortDescription, request.LongDescription);
        await _repository.UpdateAsync(rfp, cancellationToken);
        return Unit.Value;
    }
}
