using MediatR;

namespace Herit.Application.Features.Eoi.Commands.RejectEoi;

public record RejectEoiCommand(Guid Id) : IRequest<Unit>;

public class RejectEoiCommandHandler : IRequestHandler<RejectEoiCommand, Unit>
{
    public Task<Unit> Handle(RejectEoiCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
