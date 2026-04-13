using Herit.Application.Exceptions;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using MediatR;

namespace Herit.Application.Features.Cfeoi.Commands.UpdateCfeoi;

public record UpdateCfeoiCommand(
    Guid Id,
    string Title,
    string Description,
    CfeoiResourceType ResourceType) : IRequest<Unit>;

public class UpdateCfeoiCommandHandler : IRequestHandler<UpdateCfeoiCommand, Unit>
{
    private readonly ICfeoiRepository _cfeoiRepository;

    public UpdateCfeoiCommandHandler(ICfeoiRepository cfeoiRepository)
    {
        _cfeoiRepository = cfeoiRepository;
    }

    public async Task<Unit> Handle(UpdateCfeoiCommand request, CancellationToken cancellationToken)
    {
        var cfeoi = await _cfeoiRepository.GetByIdAsync(request.Id, cancellationToken);
        if (cfeoi is null)
            throw new NotFoundException($"Cfeoi '{request.Id}' does not exist.");

        cfeoi.Update(
            request.Title,
            request.Description,
            request.ResourceType);

        await _cfeoiRepository.UpdateAsync(cfeoi, cancellationToken);
        return Unit.Value;
    }
}
