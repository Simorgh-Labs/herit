using MediatR;

namespace Herit.Application.Features.Rfp.Commands.PublishRfp;

public record PublishRfpCommand(Guid Id) : IRequest<Unit>;

public class PublishRfpCommandHandler : IRequestHandler<PublishRfpCommand, Unit>
{
    public Task<Unit> Handle(PublishRfpCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
