using Herit.Application.Exceptions;
using Herit.Application.Features.Rfp.Queries.GetRfpById;
using Herit.Application.Interfaces;
using NSubstitute;
using RfpEntity = Herit.Domain.Entities.Rfp;

namespace Herit.Application.Tests.Features.Rfp.Queries;

public class GetRfpByIdQueryHandlerTests
{
    private readonly IRfpRepository _repository = Substitute.For<IRfpRepository>();
    private readonly GetRfpByIdQueryHandler _handler;

    public GetRfpByIdQueryHandlerTests()
    {
        _handler = new GetRfpByIdQueryHandler(_repository);
    }

    [Fact]
    public async Task Handle_WhenRfpExists_ReturnsRfp()
    {
        var id = Guid.NewGuid();
        var rfp = RfpEntity.Create(id, "Title", "Short", Guid.NewGuid(), Guid.NewGuid(), "Long");
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(rfp);

        var result = await _handler.Handle(new GetRfpByIdQuery(id), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(id, result.Id);
    }

    [Fact]
    public async Task Handle_WhenRfpNotFound_ThrowsNotFoundException()
    {
        var id = Guid.NewGuid();
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns((RfpEntity?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => _handler.Handle(new GetRfpByIdQuery(id), CancellationToken.None));
    }
}
