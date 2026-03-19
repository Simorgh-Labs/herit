using MediatR;

namespace Herit.Application.Features.Eoi.Commands.ApproveEoi;

public record ApproveEoiCommand(Guid Id) : IRequest<Unit>;

public class ApproveEoiCommandHandler : IRequestHandler<ApproveEoiCommand, Unit>
{
    public Task<Unit> Handle(ApproveEoiCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
