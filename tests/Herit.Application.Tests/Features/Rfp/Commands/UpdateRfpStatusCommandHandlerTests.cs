using Herit.Application.Exceptions;
using Herit.Application.Features.Rfp.Commands.UpdateRfpStatus;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using NSubstitute;
using RfpEntity = Herit.Domain.Entities.Rfp;

namespace Herit.Application.Tests.Features.Rfp.Commands;

public class UpdateRfpStatusCommandHandlerTests
{
    private readonly IRfpRepository _repository = Substitute.For<IRfpRepository>();
    private readonly UpdateRfpStatusCommandHandler _handler;

    public UpdateRfpStatusCommandHandlerTests()
    {
        _handler = new UpdateRfpStatusCommandHandler(_repository);
    }

    private static RfpEntity CreateDraftRfp(Guid id)
        => RfpEntity.Create(id, "Title", "Short", Guid.NewGuid(), Guid.NewGuid(), "Long");

    [Fact]
    public async Task Handle_DraftToApproved_CallsUpdateAsyncOnce()
    {
        var id = Guid.NewGuid();
        var rfp = CreateDraftRfp(id);
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(rfp);

        var result = await _handler.Handle(new UpdateRfpStatusCommand(id, RfpStatus.Approved), CancellationToken.None);

        Assert.Equal(MediatR.Unit.Value, result);
        Assert.Equal(RfpStatus.Approved, rfp.Status);
        await _repository.Received(1).UpdateAsync(rfp, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_ApprovedToPublished_CallsUpdateAsyncOnce()
    {
        var id = Guid.NewGuid();
        var rfp = CreateDraftRfp(id);
        rfp.TransitionStatus(RfpStatus.Approved);
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(rfp);

        var result = await _handler.Handle(new UpdateRfpStatusCommand(id, RfpStatus.Published), CancellationToken.None);

        Assert.Equal(MediatR.Unit.Value, result);
        Assert.Equal(RfpStatus.Published, rfp.Status);
        await _repository.Received(1).UpdateAsync(rfp, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_RfpNotFound_ThrowsNotFoundException()
    {
        var id = Guid.NewGuid();
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns((RfpEntity?)null);

        await Assert.ThrowsAsync<NotFoundException>(
            () => _handler.Handle(new UpdateRfpStatusCommand(id, RfpStatus.Approved), CancellationToken.None));
        await _repository.DidNotReceive().UpdateAsync(Arg.Any<RfpEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_IllegalTransition_ThrowsInvalidOperationException()
    {
        var id = Guid.NewGuid();
        var rfp = CreateDraftRfp(id); // status is Draft
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(rfp);

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _handler.Handle(new UpdateRfpStatusCommand(id, RfpStatus.Published), CancellationToken.None));
        await _repository.DidNotReceive().UpdateAsync(Arg.Any<RfpEntity>(), Arg.Any<CancellationToken>());
    }
}
