using Herit.Application.Authorization;
using Herit.Application.Interfaces;
using MediatR;

namespace Herit.Application.Features.Rfp.Queries.ListRfps;

public record ListRfpsQuery() : IRequest<IEnumerable<Herit.Domain.Entities.Rfp>>;

public class ListRfpsQueryHandler : IRequestHandler<ListRfpsQuery, IEnumerable<Herit.Domain.Entities.Rfp>>
{
    private readonly IRfpRepository _repository;
    private readonly ICurrentUserService _currentUserService;

    public ListRfpsQueryHandler(IRfpRepository repository, ICurrentUserService currentUserService)
    {
        _repository = repository;
        _currentUserService = currentUserService;
    }

    public async Task<IEnumerable<Herit.Domain.Entities.Rfp>> Handle(ListRfpsQuery request, CancellationToken cancellationToken)
    {
        var user = await _currentUserService.GetCurrentUserOrNullAsync(cancellationToken);
        var rfps = await _repository.ListAsync(cancellationToken);

        return rfps.Where(r => VisibilityPolicy.CanViewRfp(r, user)).ToList();
    }
}
