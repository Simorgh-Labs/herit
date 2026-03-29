using Herit.Application.Features.Eoi.Queries.ListEoisByCfeoi;
using Herit.Application.Interfaces;
using NSubstitute;
using EoiEntity = Herit.Domain.Entities.Eoi;

namespace Herit.Application.Tests.Features.Eoi.Queries;

public class ListEoisByCfeoiQueryHandlerTests
{
    private readonly IEoiRepository _eoiRepository = Substitute.For<IEoiRepository>();
    private readonly ListEoisByCfeoiQueryHandler _handler;

    public ListEoisByCfeoiQueryHandlerTests()
    {
        _handler = new ListEoisByCfeoiQueryHandler(_eoiRepository);
    }

    [Fact]
    public async Task Handle_NonEmptyList_ReturnsAllEois()
    {
        var cfeoiId = Guid.NewGuid();
        var eois = new[]
        {
            EoiEntity.Create(Guid.NewGuid(), Guid.NewGuid(), "Message 1", cfeoiId),
            EoiEntity.Create(Guid.NewGuid(), Guid.NewGuid(), "Message 2", cfeoiId)
        };
        _eoiRepository.ListByCfeoiAsync(cfeoiId, Arg.Any<CancellationToken>()).Returns(eois);

        var result = await _handler.Handle(new ListEoisByCfeoiQuery(cfeoiId), CancellationToken.None);

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task Handle_EmptyList_ReturnsEmptyEnumerable()
    {
        var cfeoiId = Guid.NewGuid();
        _eoiRepository.ListByCfeoiAsync(cfeoiId, Arg.Any<CancellationToken>()).Returns(Enumerable.Empty<EoiEntity>());

        var result = await _handler.Handle(new ListEoisByCfeoiQuery(cfeoiId), CancellationToken.None);

        Assert.Empty(result);
    }
}
