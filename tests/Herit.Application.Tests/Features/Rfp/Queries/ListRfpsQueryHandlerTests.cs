using Herit.Application.Features.Rfp.Queries.ListRfps;
using Herit.Application.Interfaces;
using NSubstitute;
using RfpEntity = Herit.Domain.Entities.Rfp;

namespace Herit.Application.Tests.Features.Rfp.Queries;

public class ListRfpsQueryHandlerTests
{
    private readonly IRfpRepository _repository = Substitute.For<IRfpRepository>();
    private readonly ListRfpsQueryHandler _handler;

    public ListRfpsQueryHandlerTests()
    {
        _handler = new ListRfpsQueryHandler(_repository);
    }

    [Fact]
    public async Task Handle_WhenRepositoryReturnsItems_ReturnsAllItems()
    {
        var rfps = new[]
        {
            RfpEntity.Create(Guid.NewGuid(), "RFP A", "Short A", Guid.NewGuid(), Guid.NewGuid(), "Long A"),
            RfpEntity.Create(Guid.NewGuid(), "RFP B", "Short B", Guid.NewGuid(), Guid.NewGuid(), "Long B"),
        };
        _repository.ListAsync(Arg.Any<CancellationToken>()).Returns((IEnumerable<RfpEntity>)rfps);

        var result = await _handler.Handle(new ListRfpsQuery(), CancellationToken.None);

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task Handle_WhenRepositoryReturnsEmpty_ReturnsEmptyCollection()
    {
        _repository.ListAsync(Arg.Any<CancellationToken>()).Returns(Enumerable.Empty<RfpEntity>());

        var result = await _handler.Handle(new ListRfpsQuery(), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Empty(result);
    }
}
