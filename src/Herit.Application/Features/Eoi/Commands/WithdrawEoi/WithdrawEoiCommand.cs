using Herit.Application.Exceptions;
using Herit.Application.Interfaces;
using MediatR;

namespace Herit.Application.Features.Eoi.Commands.WithdrawEoi;

public record WithdrawEoiCommand(Guid Id) : IRequest<Unit>;

public class WithdrawEoiCommandHandler : IRequestHandler<WithdrawEoiCommand, Unit>
{
    private readonly IEoiRepository _eoiRepository;

    public WithdrawEoiCommandHandler(IEoiRepository eoiRepository)
    {
        _eoiRepository = eoiRepository;
    }

    public async Task<Unit> Handle(WithdrawEoiCommand request, CancellationToken cancellationToken)
    {
        var eoi = await _eoiRepository.GetByIdAsync(request.Id, cancellationToken);
        if (eoi is null)
            throw new NotFoundException($"Eoi '{request.Id}' does not exist.");

        await _eoiRepository.DeleteAsync(request.Id, cancellationToken);
        return Unit.Value;
    }
}
