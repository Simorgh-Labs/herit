using Herit.Domain.Enums;
using MediatR;

namespace Herit.Application.Features.Cfeoi.Commands.PublishCfeoi;

public record PublishCfeoiCommand(
    string Title,
    string Description,
    CfeoiResourceType ResourceType,
    Guid ProposalId) : IRequest<Guid>;

public class PublishCfeoiCommandHandler : IRequestHandler<PublishCfeoiCommand, Guid>
{
    public Task<Guid> Handle(PublishCfeoiCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
