using Herit.Application.Exceptions;
using Herit.Application.Features.Rfp.Commands.UpdateRfp;
using Herit.Application.Interfaces;
using NSubstitute;
using RfpEntity = Herit.Domain.Entities.Rfp;

namespace Herit.Application.Tests.Features.Rfp.Commands;

public class UpdateRfpCommandHandlerTests
{
    private readonly IRfpRepository _repository = Substitute.For<IRfpRepository>();
    private readonly UpdateRfpCommandHandler _handler;

    public UpdateRfpCommandHandlerTests()
    {
        _handler = new UpdateRfpCommandHandler(_repository);
    }

    [Fact]
    public async Task Handle_WithExistingRfp_UpdatesFieldsAndCallsUpdateAsync()
    {
        var id = Guid.NewGuid();
        var rfp = RfpEntity.Create(id, "Old Title", "Old Short", Guid.NewGuid(), Guid.NewGuid(), "Old Long");
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(rfp);

        var command = new UpdateRfpCommand(id, "New Title", "New Short", "New Long", "music,dance");
        var result = await _handler.Handle(command, CancellationToken.None);

        Assert.Equal(MediatR.Unit.Value, result);
        Assert.Equal("New Title", rfp.Title);
        Assert.Equal("New Short", rfp.ShortDescription);
        Assert.Equal("New Long", rfp.LongDescription);
        Assert.Equal("music,dance", rfp.Tags);
        await _repository.Received(1).UpdateAsync(rfp, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithNonExistentRfp_ThrowsNotFoundException()
    {
        var id = Guid.NewGuid();
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns((RfpEntity?)null);

        var command = new UpdateRfpCommand(id, "Title", "Short", "Long");

        await Assert.ThrowsAsync<NotFoundException>(() => _handler.Handle(command, CancellationToken.None));
        await _repository.DidNotReceive().UpdateAsync(Arg.Any<RfpEntity>(), Arg.Any<CancellationToken>());
    }
}
