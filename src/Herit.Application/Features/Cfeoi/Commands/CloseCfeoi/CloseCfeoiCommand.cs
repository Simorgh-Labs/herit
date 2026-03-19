using MediatR;

namespace Herit.Application.Features.Cfeoi.Commands.CloseCfeoi;

public record CloseCfeoiCommand(Guid Id) : IRequest<Unit>;

public class CloseCfeoiCommandHandler : IRequestHandler<CloseCfeoiCommand, Unit>
{
    public Task<Unit> Handle(CloseCfeoiCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
