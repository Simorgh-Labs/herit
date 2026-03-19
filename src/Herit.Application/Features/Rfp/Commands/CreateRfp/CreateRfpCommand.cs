using MediatR;

namespace Herit.Application.Features.Rfp.Commands.CreateRfp;

public record CreateRfpCommand(
    string Title,
    string ShortDescription,
    Guid AuthorId,
    Guid DepartmentId,
    string LongDescription) : IRequest<Guid>;

public class CreateRfpCommandHandler : IRequestHandler<CreateRfpCommand, Guid>
{
    public Task<Guid> Handle(CreateRfpCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
