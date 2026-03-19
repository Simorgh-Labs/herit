using MediatR;

namespace Herit.Application.Features.Rfp.Commands.DeleteRfp;

public record DeleteRfpCommand(Guid Id) : IRequest<Unit>;

public class DeleteRfpCommandHandler : IRequestHandler<DeleteRfpCommand, Unit>
{
    public Task<Unit> Handle(DeleteRfpCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
