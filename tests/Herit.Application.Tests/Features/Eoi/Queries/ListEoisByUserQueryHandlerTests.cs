using Herit.Application.Features.Eoi.Queries.ListEoisByUser;
using Herit.Application.Interfaces;
using NSubstitute;
using EoiEntity = Herit.Domain.Entities.Eoi;

namespace Herit.Application.Tests.Features.Eoi.Queries;

public class ListEoisByUserQueryHandlerTests
{
    private readonly IEoiRepository _eoiRepository = Substitute.For<IEoiRepository>();
    private readonly ListEoisByUserQueryHandler _handler;

    public ListEoisByUserQueryHandlerTests()
    {
        _handler = new ListEoisByUserQueryHandler(_eoiRepository);
    }

    [Fact]
    public async Task Handle_NonEmptyList_ReturnsAllEoisForUser()
    {
        var userId = Guid.NewGuid();
        var eois = new[]
        {
            EoiEntity.Create(Guid.NewGuid(), userId, "Message 1", Guid.NewGuid()),
            EoiEntity.Create(Guid.NewGuid(), userId, "Message 2", Guid.NewGuid())
        };
        _eoiRepository.ListByUserAsync(userId, Arg.Any<CancellationToken>()).Returns(eois);

        var result = await _handler.Handle(new ListEoisByUserQuery(userId), CancellationToken.None);

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task Handle_EmptyList_ReturnsEmptyEnumerable()
    {
        var userId = Guid.NewGuid();
        _eoiRepository.ListByUserAsync(userId, Arg.Any<CancellationToken>()).Returns(Enumerable.Empty<EoiEntity>());

        var result = await _handler.Handle(new ListEoisByUserQuery(userId), CancellationToken.None);

        Assert.Empty(result);
    }
}
