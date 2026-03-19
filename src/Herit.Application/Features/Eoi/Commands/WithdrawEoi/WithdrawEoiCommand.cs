using MediatR;

namespace Herit.Application.Features.Eoi.Commands.WithdrawEoi;

public record WithdrawEoiCommand(Guid Id) : IRequest<Unit>;

public class WithdrawEoiCommandHandler : IRequestHandler<WithdrawEoiCommand, Unit>
{
    public Task<Unit> Handle(WithdrawEoiCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
