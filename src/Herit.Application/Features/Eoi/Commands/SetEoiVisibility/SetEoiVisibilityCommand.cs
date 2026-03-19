using Herit.Domain.Enums;
using MediatR;

namespace Herit.Application.Features.Eoi.Commands.SetEoiVisibility;

public record SetEoiVisibilityCommand(Guid Id, EoiVisibility Visibility) : IRequest<Unit>;

public class SetEoiVisibilityCommandHandler : IRequestHandler<SetEoiVisibilityCommand, Unit>
{
    public Task<Unit> Handle(SetEoiVisibilityCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
