using Herit.Application.Interfaces;
using MediatR;

namespace Herit.Application.Features.Rfp.Commands.DeleteRfp;

public record DeleteRfpCommand(Guid Id) : IRequest<Unit>;

public class DeleteRfpCommandHandler : IRequestHandler<DeleteRfpCommand, Unit>
{
    private readonly IRfpRepository _repository;

    public DeleteRfpCommandHandler(IRfpRepository repository)
    {
        _repository = repository;
    }

    public async Task<Unit> Handle(DeleteRfpCommand request, CancellationToken cancellationToken)
    {
        await _repository.DeleteAsync(request.Id, cancellationToken);
        return Unit.Value;
    }
}
