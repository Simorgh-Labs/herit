using Herit.Api.Controllers;
using Herit.Application.Features.Eoi.Queries.ListEoisByUser;
using Herit.Application.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using EoiEntity = Herit.Domain.Entities.Eoi;

namespace Herit.Api.Tests.Controllers;

public class EoiControllerTests
{
    private readonly IMediator _mediator = Substitute.For<IMediator>();
    private readonly ICurrentUserService _currentUserService = Substitute.For<ICurrentUserService>();
    private readonly EoiController _controller;

    public EoiControllerTests()
    {
        _controller = new EoiController(_mediator, _currentUserService);
    }

    [Fact]
    public async Task ListMyEois_ReturnsOkWithEois()
    {
        var userId = Guid.NewGuid();
        var eois = new[]
        {
            EoiEntity.Create(Guid.NewGuid(), userId, "Message 1", Guid.NewGuid()),
            EoiEntity.Create(Guid.NewGuid(), userId, "Message 2", Guid.NewGuid())
        };
        _currentUserService.GetCurrentUserId().Returns(userId);
        _mediator.Send(Arg.Any<ListEoisByUserQuery>(), Arg.Any<CancellationToken>())
            .Returns((IEnumerable<EoiEntity>)eois);

        var result = await _controller.ListMyEois(CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result);
        var returned = Assert.IsAssignableFrom<IEnumerable<EoiEntity>>(ok.Value);
        Assert.Equal(2, returned.Count());
    }

    [Fact]
    public async Task ListMyEois_SendsQueryWithCurrentUserId()
    {
        var userId = Guid.NewGuid();
        _currentUserService.GetCurrentUserId().Returns(userId);
        _mediator.Send(Arg.Any<ListEoisByUserQuery>(), Arg.Any<CancellationToken>())
            .Returns(Enumerable.Empty<EoiEntity>());

        await _controller.ListMyEois(CancellationToken.None);

        await _mediator.Received(1).Send(
            Arg.Is<ListEoisByUserQuery>(q => q.UserId == userId),
            Arg.Any<CancellationToken>());
    }
}
