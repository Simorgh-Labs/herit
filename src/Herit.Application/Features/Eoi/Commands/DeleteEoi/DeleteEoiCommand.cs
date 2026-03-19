using MediatR;

namespace Herit.Application.Features.Eoi.Commands.DeleteEoi;

public record DeleteEoiCommand(Guid Id) : IRequest<Unit>;

public class DeleteEoiCommandHandler : IRequestHandler<DeleteEoiCommand, Unit>
{
    public Task<Unit> Handle(DeleteEoiCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
