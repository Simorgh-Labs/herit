using Herit.Application.Exceptions;
using Herit.Application.Features.Rfp.Commands.DeleteRfp;
using Herit.Application.Interfaces;
using NSubstitute;
using NSubstitute.ExceptionExtensions;

namespace Herit.Application.Tests.Features.Rfp.Commands;

public class DeleteRfpCommandHandlerTests
{
    private readonly IRfpRepository _repository = Substitute.For<IRfpRepository>();
    private readonly DeleteRfpCommandHandler _handler;

    public DeleteRfpCommandHandlerTests()
    {
        _handler = new DeleteRfpCommandHandler(_repository);
    }

    [Fact]
    public async Task Handle_WithExistingRfp_CallsDeleteAsyncOnce()
    {
        var id = Guid.NewGuid();

        var result = await _handler.Handle(new DeleteRfpCommand(id), CancellationToken.None);

        Assert.Equal(MediatR.Unit.Value, result);
        await _repository.Received(1).DeleteAsync(id, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithNonExistentRfp_ThrowsNotFoundException()
    {
        var id = Guid.NewGuid();
        _repository.DeleteAsync(id, Arg.Any<CancellationToken>())
            .Throws(new NotFoundException($"Rfp with id '{id}' was not found."));

        await Assert.ThrowsAsync<NotFoundException>(
            () => _handler.Handle(new DeleteRfpCommand(id), CancellationToken.None));
    }
}
