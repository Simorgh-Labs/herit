using Herit.Application.Features.Proposal.Queries.ListProposals;
using Herit.Application.Interfaces;
using Herit.Domain.Entities;
using UserEntity = Herit.Domain.Entities.User;
using Herit.Domain.Enums;
using NSubstitute;
using ProposalEntity = Herit.Domain.Entities.Proposal;

namespace Herit.Application.Tests.Features.Proposal.Queries;

public class ListProposalsQueryHandlerTests
{
    private readonly IProposalRepository _proposalRepository = Substitute.For<IProposalRepository>();
    private readonly IUserRepository _userRepository = Substitute.For<IUserRepository>();
    private readonly IOrganisationRepository _organisationRepository = Substitute.For<IOrganisationRepository>();
    private readonly ICurrentUserService _currentUserService = Substitute.For<ICurrentUserService>();
    private readonly ListProposalsQueryHandler _handler;

    private readonly Guid _ownerId = Guid.NewGuid();
    private readonly ProposalEntity _public;
    private readonly ProposalEntity _shared;
    private readonly ProposalEntity _privateOwned;

    public ListProposalsQueryHandlerTests()
    {
        _handler = new ListProposalsQueryHandler(_proposalRepository, _userRepository, _organisationRepository, _currentUserService);

        _public = MakeProposal(ProposalVisibility.Public, _ownerId);
        _shared = MakeProposal(ProposalVisibility.Shared, _ownerId);
        _privateOwned = MakeProposal(ProposalVisibility.Private, _ownerId);

        _proposalRepository.ListAsync(Arg.Any<CancellationToken>())
            .Returns(new[] { _public, _shared, _privateOwned });
        _userRepository.ListByIdsAsync(Arg.Any<IEnumerable<Guid>>(), Arg.Any<CancellationToken>())
            .Returns(Enumerable.Empty<UserEntity>());
        _organisationRepository.ListAsync(Arg.Any<CancellationToken>())
            .Returns(Enumerable.Empty<Herit.Domain.Entities.Organisation>());
    }

    private static ProposalEntity MakeProposal(ProposalVisibility visibility, Guid authorId)
    {
        var proposal = ProposalEntity.Create(Guid.NewGuid(), "Title", "Short", authorId, Guid.NewGuid(), "Long");
        proposal.SetVisibility(visibility);
        return proposal;
    }

    private static UserEntity MakeUser(Guid id, UserRole role)
        => UserEntity.Create(id, $"ext-{id}", "user@example.com", "User", role);

    private void CurrentUser(UserEntity? user)
        => _currentUserService.GetCurrentUserOrNullAsync(Arg.Any<CancellationToken>()).Returns(user);

    [Fact]
    public async Task Handle_Anonymous_ReturnsOnlyPublic()
    {
        CurrentUser(null);

        var result = await _handler.Handle(new ListProposalsQuery(), CancellationToken.None);

        Assert.Equal(new[] { _public.Id }, result.Select(p => p.Id));
    }

    [Fact]
    public async Task Handle_AuthenticatedNonOwnerExpat_ReturnsPublicAndShared()
    {
        CurrentUser(MakeUser(Guid.NewGuid(), UserRole.Expat));

        var result = await _handler.Handle(new ListProposalsQuery(), CancellationToken.None);

        Assert.Equal(new[] { _public.Id, _shared.Id }, result.Select(p => p.Id));
    }

    [Fact]
    public async Task Handle_OwnerExpat_ReturnsPublicSharedAndOwnPrivate()
    {
        CurrentUser(MakeUser(_ownerId, UserRole.Expat));

        var result = await _handler.Handle(new ListProposalsQuery(), CancellationToken.None);

        Assert.Equal(
            new[] { _public.Id, _shared.Id, _privateOwned.Id },
            result.Select(p => p.Id));
    }

    [Fact]
    public async Task Handle_NonOwnerExpat_DoesNotReturnOthersPrivate()
    {
        CurrentUser(MakeUser(Guid.NewGuid(), UserRole.Expat));

        var result = await _handler.Handle(new ListProposalsQuery(), CancellationToken.None);

        Assert.DoesNotContain(result, p => p.Id == _privateOwned.Id);
    }

    [Theory]
    [InlineData(UserRole.Staff)]
    [InlineData(UserRole.OrganisationAdmin)]
    [InlineData(UserRole.SuperAdmin)]
    public async Task Handle_Staff_ReturnsAllRegardlessOfVisibility(UserRole role)
    {
        CurrentUser(MakeUser(Guid.NewGuid(), role));

        var result = await _handler.Handle(new ListProposalsQuery(), CancellationToken.None);

        Assert.Equal(3, result.Count());
    }

    [Fact]
    public async Task Handle_WithRfpIdFilter_AppliesFilterOnTopOfAuthorization()
    {
        var rfpId = Guid.NewGuid();
        var publicForRfp = ProposalEntity.Create(Guid.NewGuid(), "T", "S", _ownerId, Guid.NewGuid(), "L", rfpId);
        publicForRfp.SetVisibility(ProposalVisibility.Public);
        var privateForRfp = ProposalEntity.Create(Guid.NewGuid(), "T", "S", _ownerId, Guid.NewGuid(), "L", rfpId);
        // stays Private (default)

        _proposalRepository.ListAsync(Arg.Any<CancellationToken>())
            .Returns(new[] { _public, publicForRfp, privateForRfp });
        CurrentUser(null);

        var result = await _handler.Handle(new ListProposalsQuery(rfpId), CancellationToken.None);

        Assert.Equal(new[] { publicForRfp.Id }, result.Select(p => p.Id));
    }
}
