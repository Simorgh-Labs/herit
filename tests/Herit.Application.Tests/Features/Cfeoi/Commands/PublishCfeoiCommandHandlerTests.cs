using Herit.Application.Exceptions;
using Herit.Application.Features.Cfeoi.Commands.PublishCfeoi;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using NSubstitute;
using CfeoiEntity = Herit.Domain.Entities.Cfeoi;
using ProposalEntity = Herit.Domain.Entities.Proposal;
using UserEntity = Herit.Domain.Entities.User;

namespace Herit.Application.Tests.Features.Cfeoi.Commands;

public class PublishCfeoiCommandHandlerTests
{
    private readonly ICfeoiRepository _cfeoiRepository = Substitute.For<ICfeoiRepository>();
    private readonly IProposalRepository _proposalRepository = Substitute.For<IProposalRepository>();
    private readonly ICurrentUserService _currentUserService = Substitute.For<ICurrentUserService>();
    private readonly PublishCfeoiCommandHandler _handler;

    public PublishCfeoiCommandHandlerTests()
    {
        _handler = new PublishCfeoiCommandHandler(_cfeoiRepository, _proposalRepository, _currentUserService);
    }

    private static PublishCfeoiCommand BuildCommand(Guid proposalId, string? tags = null) =>
        new("CFEOI Title", "Description", CfeoiResourceType.Human, proposalId, tags);

    private static UserEntity CreateUser(Guid id, UserRole role)
        => UserEntity.Create(id, $"ext-{id}", "user@example.com", "Test User", role);

    private void SetCurrentUser(UserEntity user)
        => _currentUserService.GetCurrentUserAsync(Arg.Any<CancellationToken>()).Returns(user);

    [Fact]
    public async Task Handle_AsProposalOwner_ReturnsValidGuidAndCallsAddAsync()
    {
        var proposalId = Guid.NewGuid();
        var authorId = Guid.NewGuid();
        _proposalRepository.GetByIdAsync(proposalId, Arg.Any<CancellationToken>())
            .Returns(ProposalEntity.Create(proposalId, "Title", "Short", authorId, Guid.NewGuid(), "Long"));
        SetCurrentUser(CreateUser(authorId, UserRole.Expat));

        var result = await _handler.Handle(BuildCommand(proposalId, "heritage,culture"), CancellationToken.None);

        Assert.NotEqual(Guid.Empty, result);
        await _cfeoiRepository.Received(1).AddAsync(
            Arg.Is<CfeoiEntity>(c =>
                c.Title == "CFEOI Title" &&
                c.ProposalId == proposalId &&
                c.Tags == "heritage,culture"),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_AsStaff_ReturnsValidGuidAndCallsAddAsync()
    {
        var proposalId = Guid.NewGuid();
        _proposalRepository.GetByIdAsync(proposalId, Arg.Any<CancellationToken>())
            .Returns(ProposalEntity.Create(proposalId, "Title", "Short", Guid.NewGuid(), Guid.NewGuid(), "Long"));
        SetCurrentUser(CreateUser(Guid.NewGuid(), UserRole.Staff));

        var result = await _handler.Handle(BuildCommand(proposalId), CancellationToken.None);

        Assert.NotEqual(Guid.Empty, result);
        await _cfeoiRepository.Received(1).AddAsync(Arg.Any<CfeoiEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_AsNonOwnerExpat_ThrowsForbiddenException()
    {
        var proposalId = Guid.NewGuid();
        _proposalRepository.GetByIdAsync(proposalId, Arg.Any<CancellationToken>())
            .Returns(ProposalEntity.Create(proposalId, "Title", "Short", Guid.NewGuid(), Guid.NewGuid(), "Long"));
        SetCurrentUser(CreateUser(Guid.NewGuid(), UserRole.Expat));

        await Assert.ThrowsAsync<ForbiddenException>(() => _handler.Handle(BuildCommand(proposalId), CancellationToken.None));
        await _cfeoiRepository.DidNotReceive().AddAsync(Arg.Any<CfeoiEntity>(), Arg.Any<CancellationToken>());
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
