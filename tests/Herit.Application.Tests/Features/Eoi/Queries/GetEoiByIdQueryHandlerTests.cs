using Herit.Application.Features.Eoi.Queries.GetEoiById;
using Herit.Application.Interfaces;
using NSubstitute;
using EoiEntity = Herit.Domain.Entities.Eoi;

namespace Herit.Application.Tests.Features.Eoi.Queries;

public class GetEoiByIdQueryHandlerTests
{
    private readonly IEoiRepository _eoiRepository = Substitute.For<IEoiRepository>();
    private readonly GetEoiByIdQueryHandler _handler;

    public GetEoiByIdQueryHandlerTests()
    {
        _handler = new GetEoiByIdQueryHandler(_eoiRepository);
    }

    [Fact]
    public async Task Handle_EoiFound_ReturnsEoi()
    {
        var eoiId = Guid.NewGuid();
        var eoi = EoiEntity.Create(eoiId, Guid.NewGuid(), "Message", Guid.NewGuid());
        _eoiRepository.GetByIdAsync(eoiId, Arg.Any<CancellationToken>()).Returns(eoi);

        var result = await _handler.Handle(new GetEoiByIdQuery(eoiId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(eoiId, result.Id);
    }

    [Fact]
    public async Task Handle_EoiNotFound_ReturnsNull()
    {
        var eoiId = Guid.NewGuid();
        _eoiRepository.GetByIdAsync(eoiId, Arg.Any<CancellationToken>()).Returns((EoiEntity?)null);

        var result = await _handler.Handle(new GetEoiByIdQuery(eoiId), CancellationToken.None);

        Assert.Null(result);
    }
}
