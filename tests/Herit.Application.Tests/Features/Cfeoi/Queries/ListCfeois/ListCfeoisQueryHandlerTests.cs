using Herit.Application.Features.Cfeoi.Queries.ListCfeois;
using Herit.Application.Interfaces;
using Herit.Domain.Entities;
using UserEntity = Herit.Domain.Entities.User;
using Herit.Domain.Enums;
using NSubstitute;
using CfeoiEntity = Herit.Domain.Entities.Cfeoi;
using ProposalEntity = Herit.Domain.Entities.Proposal;

namespace Herit.Application.Tests.Features.Cfeoi.Queries.ListCfeois;

public class ListCfeoisQueryHandlerTests
{
    private readonly ICfeoiRepository _cfeoiRepository = Substitute.For<ICfeoiRepository>();
    private readonly IProposalRepository _proposalRepository = Substitute.For<IProposalRepository>();
    private readonly ICurrentUserService _currentUserService = Substitute.For<ICurrentUserService>();
    private readonly ListCfeoisQueryHandler _handler;

    private readonly Guid _ownerId = Guid.NewGuid();
    private readonly ProposalEntity _publicProposal;
    private readonly ProposalEntity _sharedProposal;
    private readonly ProposalEntity _privateProposal;
    private readonly CfeoiEntity _underPublic;
    private readonly CfeoiEntity _underShared;
    private readonly CfeoiEntity _underPrivate;

    public ListCfeoisQueryHandlerTests()
    {
        _handler = new ListCfeoisQueryHandler(_cfeoiRepository, _proposalRepository, _currentUserService);

        _publicProposal = MakeProposal(ProposalVisibility.Public, _ownerId);
        _sharedProposal = MakeProposal(ProposalVisibility.Shared, _ownerId);
        _privateProposal = MakeProposal(ProposalVisibility.Private, _ownerId);

        _underPublic = MakeCfeoi(_publicProposal.Id);
        _underShared = MakeCfeoi(_sharedProposal.Id);
        _underPrivate = MakeCfeoi(_privateProposal.Id);

        _proposalRepository.ListAsync(Arg.Any<CancellationToken>())
            .Returns(new[] { _publicProposal, _sharedProposal, _privateProposal });
        _cfeoiRepository.ListAsync(null, null, Arg.Any<CancellationToken>())
            .Returns(new[] { _underPublic, _underShared, _underPrivate });
    }

    private static ProposalEntity MakeProposal(ProposalVisibility visibility, Guid authorId)
    {
        var proposal = ProposalEntity.Create(Guid.NewGuid(), "Title", "Short", authorId, Guid.NewGuid(), "Long");
        proposal.SetVisibility(visibility);
        return proposal;
    }

    private static CfeoiEntity MakeCfeoi(Guid proposalId)
        => CfeoiEntity.Create(Guid.NewGuid(), "CFEOI", "Description", CfeoiResourceType.Human, proposalId);

    private static UserEntity MakeUser(Guid id, UserRole role)
        => UserEntity.Create(id, $"ext-{id}", "user@example.com", "User", role);

    private void CurrentUser(UserEntity? user)
        => _currentUserService.GetCurrentUserOrNullAsync(Arg.Any<CancellationToken>()).Returns(user);

    [Fact]
    public async Task Handle_Anonymous_ReturnsOnlyCfeoisUnderPublicProposals()
    {
        CurrentUser(null);

        var result = await _handler.Handle(new ListCfeoisQuery(), CancellationToken.None);

        Assert.Equal(new[] { _underPublic.Id }, result.Select(c => c.Id));
    }

    [Fact]
    public async Task Handle_NonOwnerExpat_ReturnsCfeoisUnderPublicAndShared()
    {
        CurrentUser(MakeUser(Guid.NewGuid(), UserRole.Expat));

        var result = await _handler.Handle(new ListCfeoisQuery(), CancellationToken.None);

        Assert.Equal(new[] { _underPublic.Id, _underShared.Id }, result.Select(c => c.Id));
    }

    [Fact]
    public async Task Handle_ProposalOwner_ReturnsCfeoiUnderOwnPrivateProposal()
    {
        CurrentUser(MakeUser(_ownerId, UserRole.Expat));

        var result = await _handler.Handle(new ListCfeoisQuery(), CancellationToken.None);

        Assert.Contains(result, c => c.Id == _underPrivate.Id);
    }

    [Fact]
    public async Task Handle_Staff_ReturnsAllCfeois()
    {
        CurrentUser(MakeUser(Guid.NewGuid(), UserRole.Staff));

        var result = await _handler.Handle(new ListCfeoisQuery(), CancellationToken.None);

        Assert.Equal(3, result.Count());
    }

    [Fact]
    public async Task Handle_FilterByStatus_PassesStatusToRepository()
    {
        _cfeoiRepository.ListAsync(CfeoiStatus.Open, null, Arg.Any<CancellationToken>())
            .Returns(new[] { _underPublic });
        CurrentUser(MakeUser(Guid.NewGuid(), UserRole.Staff));

        var result = await _handler.Handle(new ListCfeoisQuery(Status: CfeoiStatus.Open), CancellationToken.None);

        Assert.Single(result);
        await _cfeoiRepository.Received(1).ListAsync(CfeoiStatus.Open, null, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_FilterByProposalId_PassesProposalIdToRepository()
    {
        _cfeoiRepository.ListAsync(null, _publicProposal.Id, Arg.Any<CancellationToken>())
            .Returns(new[] { _underPublic });
        CurrentUser(MakeUser(Guid.NewGuid(), UserRole.Staff));

        var result = await _handler.Handle(new ListCfeoisQuery(ProposalId: _publicProposal.Id), CancellationToken.None);

        Assert.Single(result);
        await _cfeoiRepository.Received(1).ListAsync(null, _publicProposal.Id, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_EmptyList_ReturnsEmptyEnumerable()
    {
        _cfeoiRepository.ListAsync(null, null, Arg.Any<CancellationToken>()).Returns(Enumerable.Empty<CfeoiEntity>());
        CurrentUser(MakeUser(Guid.NewGuid(), UserRole.Staff));

        var result = await _handler.Handle(new ListCfeoisQuery(), CancellationToken.None);

        Assert.Empty(result);
    }
}
