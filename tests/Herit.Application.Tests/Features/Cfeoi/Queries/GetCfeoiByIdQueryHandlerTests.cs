using Herit.Application.Features.Cfeoi.Queries.GetCfeoiById;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using NSubstitute;
using CfeoiEntity = Herit.Domain.Entities.Cfeoi;

namespace Herit.Application.Tests.Features.Cfeoi.Queries;

public class GetCfeoiByIdQueryHandlerTests
{
    private readonly ICfeoiRepository _cfeoiRepository = Substitute.For<ICfeoiRepository>();
    private readonly GetCfeoiByIdQueryHandler _handler;

    public GetCfeoiByIdQueryHandlerTests()
    {
        _handler = new GetCfeoiByIdQueryHandler(_cfeoiRepository);
    }

    [Fact]
    public async Task Handle_CfeoiFound_ReturnsCfeoi()
    {
        var cfeoiId = Guid.NewGuid();
        var cfeoi = CfeoiEntity.Create(cfeoiId, "Title", "Description", CfeoiResourceType.Human, Guid.NewGuid());
        _cfeoiRepository.GetByIdAsync(cfeoiId, Arg.Any<CancellationToken>()).Returns(cfeoi);

        var result = await _handler.Handle(new GetCfeoiByIdQuery(cfeoiId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(cfeoiId, result.Id);
    }

    [Fact]
    public async Task Handle_CfeoiNotFound_ReturnsNull()
    {
        var cfeoiId = Guid.NewGuid();
        _cfeoiRepository.GetByIdAsync(cfeoiId, Arg.Any<CancellationToken>()).Returns((CfeoiEntity?)null);

        var result = await _handler.Handle(new GetCfeoiByIdQuery(cfeoiId), CancellationToken.None);

        Assert.Null(result);
    }
}
