using Herit.Domain.Enums;
using MediatR;

namespace Herit.Application.Features.Rfp.Commands.UpdateRfpStatus;

public record UpdateRfpStatusCommand(Guid Id, RfpStatus NewStatus) : IRequest<Unit>;

public class UpdateRfpStatusCommandHandler : IRequestHandler<UpdateRfpStatusCommand, Unit>
{
    public Task<Unit> Handle(UpdateRfpStatusCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
