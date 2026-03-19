using MediatR;

namespace Herit.Application.Features.Eoi.Commands.SubmitEoi;

public record SubmitEoiCommand(
    Guid SubmittedById,
    string Message,
    Guid ProposalId,
    Guid? CfeoiId = null) : IRequest<Guid>;

public class SubmitEoiCommandHandler : IRequestHandler<SubmitEoiCommand, Guid>
{
    public Task<Guid> Handle(SubmitEoiCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
