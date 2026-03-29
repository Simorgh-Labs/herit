using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using MediatR;
using EoiEntity = Herit.Domain.Entities.Eoi;

namespace Herit.Application.Features.Eoi.Commands.SubmitEoi;

public record SubmitEoiCommand(
    Guid SubmittedById,
    string Message,
    Guid CfeoiId) : IRequest<Guid>;

public class SubmitEoiCommandHandler : IRequestHandler<SubmitEoiCommand, Guid>
{
    private readonly IEoiRepository _eoiRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICfeoiRepository _cfeoiRepository;

    public SubmitEoiCommandHandler(IEoiRepository eoiRepository, IUserRepository userRepository, ICfeoiRepository cfeoiRepository)
    {
        _eoiRepository = eoiRepository;
        _userRepository = userRepository;
        _cfeoiRepository = cfeoiRepository;
    }

    public async Task<Guid> Handle(SubmitEoiCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.SubmittedById, cancellationToken);
        if (user is null)
            throw new InvalidOperationException($"User '{request.SubmittedById}' does not exist.");

        var cfeoi = await _cfeoiRepository.GetByIdAsync(request.CfeoiId, cancellationToken);
        if (cfeoi is null)
            throw new InvalidOperationException($"Cfeoi '{request.CfeoiId}' does not exist.");

        if (cfeoi.Status != CfeoiStatus.Open)
            throw new InvalidOperationException($"Cfeoi '{request.CfeoiId}' is not open for submissions.");

        var id = Guid.NewGuid();
        var eoi = EoiEntity.Create(id, request.SubmittedById, request.Message, request.CfeoiId);
        await _eoiRepository.AddAsync(eoi, cancellationToken);
        return id;
    }
}
