using Herit.Application.Interfaces;
using MediatR;

namespace Herit.Application.Features.Eoi.Commands.DeleteEoi;

public record DeleteEoiCommand(Guid Id) : IRequest<Unit>;

public class DeleteEoiCommandHandler : IRequestHandler<DeleteEoiCommand, Unit>
{
    private readonly IEoiRepository _eoiRepository;

    public DeleteEoiCommandHandler(IEoiRepository eoiRepository)
    {
        _eoiRepository = eoiRepository;
    }

    public async Task<Unit> Handle(DeleteEoiCommand request, CancellationToken cancellationToken)
    {
        var eoi = await _eoiRepository.GetByIdAsync(request.Id, cancellationToken);
        if (eoi is null)
            throw new InvalidOperationException($"Eoi '{request.Id}' does not exist.");

        await _eoiRepository.DeleteAsync(request.Id, cancellationToken);
        return Unit.Value;
    }
}
