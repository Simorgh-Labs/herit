using Herit.Application.Exceptions;
using Herit.Application.Features.Cfeoi.Commands.PublishCfeoi;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using NSubstitute;
using CfeoiEntity = Herit.Domain.Entities.Cfeoi;
using ProposalEntity = Herit.Domain.Entities.Proposal;

namespace Herit.Application.Tests.Features.Cfeoi.Commands;

public class PublishCfeoiCommandHandlerTests
{
    private readonly ICfeoiRepository _cfeoiRepository = Substitute.For<ICfeoiRepository>();
    private readonly IProposalRepository _proposalRepository = Substitute.For<IProposalRepository>();
    private readonly PublishCfeoiCommandHandler _handler;

    public PublishCfeoiCommandHandlerTests()
    {
        _handler = new PublishCfeoiCommandHandler(_cfeoiRepository, _proposalRepository);
    }

    private static PublishCfeoiCommand BuildCommand(Guid proposalId) =>
        new("CFEOI Title", "Description", CfeoiResourceType.Human, proposalId);

    [Fact]
    public async Task Handle_HappyPath_ReturnsValidGuidAndCallsAddAsync()
    {
        var proposalId = Guid.NewGuid();
        _proposalRepository.GetByIdAsync(proposalId, Arg.Any<CancellationToken>())
            .Returns(ProposalEntity.Create(proposalId, "Title", "Short", Guid.NewGuid(), Guid.NewGuid(), "Long"));

        var result = await _handler.Handle(BuildCommand(proposalId), CancellationToken.None);

        Assert.NotEqual(Guid.Empty, result);
        await _cfeoiRepository.Received(1).AddAsync(
            Arg.Is<CfeoiEntity>(c =>
                c.Title == "CFEOI Title" &&
                c.ProposalId == proposalId),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_ProposalNotFound_ThrowsNotFoundException()
    {
        var proposalId = Guid.NewGuid();
        _proposalRepository.GetByIdAsync(proposalId, Arg.Any<CancellationToken>()).Returns((ProposalEntity?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => _handler.Handle(BuildCommand(proposalId), CancellationToken.None));
        await _cfeoiRepository.DidNotReceive().AddAsync(Arg.Any<CfeoiEntity>(), Arg.Any<CancellationToken>());
    }
}
