using MediatR;

namespace Herit.Application.Features.Rfp.Commands.UpdateRfp;

public record UpdateRfpCommand(
    Guid Id,
    string Title,
    string ShortDescription,
    string LongDescription) : IRequest<Unit>;

public class UpdateRfpCommandHandler : IRequestHandler<UpdateRfpCommand, Unit>
{
    public Task<Unit> Handle(UpdateRfpCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
