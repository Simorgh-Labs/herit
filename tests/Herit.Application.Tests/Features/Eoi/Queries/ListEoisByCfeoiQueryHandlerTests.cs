using Herit.Application.Features.Eoi.Queries.ListEoisByCfeoi;
using Herit.Application.Interfaces;
using Herit.Domain.Entities;
using UserEntity = Herit.Domain.Entities.User;
using Herit.Domain.Enums;
using NSubstitute;
using CfeoiEntity = Herit.Domain.Entities.Cfeoi;
using EoiEntity = Herit.Domain.Entities.Eoi;
using ProposalEntity = Herit.Domain.Entities.Proposal;

namespace Herit.Application.Tests.Features.Eoi.Queries;

public class ListEoisByCfeoiQueryHandlerTests
{
    private readonly IEoiRepository _eoiRepository = Substitute.For<IEoiRepository>();
    private readonly ICfeoiRepository _cfeoiRepository = Substitute.For<ICfeoiRepository>();
    private readonly IProposalRepository _proposalRepository = Substitute.For<IProposalRepository>();
    private readonly IUserRepository _userRepository = Substitute.For<IUserRepository>();
    private readonly ICurrentUserService _currentUserService = Substitute.For<ICurrentUserService>();
    private readonly ListEoisByCfeoiQueryHandler _handler;

    private readonly Guid _cfeoiId = Guid.NewGuid();
    private readonly Guid _proposalOwnerId = Guid.NewGuid();
    private readonly Guid _submitterAId = Guid.NewGuid();
    private readonly Guid _submitterBId = Guid.NewGuid();

    private readonly EoiEntity _privateByA;
    private readonly EoiEntity _sharedByB;
    private readonly EoiEntity _privateByB;

    public ListEoisByCfeoiQueryHandlerTests()
    {
        _handler = new ListEoisByCfeoiQueryHandler(
            _eoiRepository, _cfeoiRepository, _proposalRepository, _userRepository, _currentUserService);

        var proposal = ProposalEntity.Create(Guid.NewGuid(), "Title", "Short", _proposalOwnerId, Guid.NewGuid(), "Long");
        var cfeoi = CfeoiEntity.Create(_cfeoiId, "CFEOI", "Description", CfeoiResourceType.Human, proposal.Id);

        _privateByA = MakeEoi(_submitterAId, EoiVisibility.Private);
        _sharedByB = MakeEoi(_submitterBId, EoiVisibility.Shared);
        _privateByB = MakeEoi(_submitterBId, EoiVisibility.Private);

        _cfeoiRepository.GetByIdAsync(_cfeoiId, Arg.Any<CancellationToken>()).Returns(cfeoi);
        _proposalRepository.GetByIdAsync(proposal.Id, Arg.Any<CancellationToken>()).Returns(proposal);
        _eoiRepository.ListByCfeoiAsync(_cfeoiId, Arg.Any<CancellationToken>())
            .Returns(new[] { _privateByA, _sharedByB, _privateByB });

        _userRepository.ListByIdsAsync(Arg.Any<IEnumerable<Guid>>(), Arg.Any<CancellationToken>())
            .Returns(callInfo =>
            {
                var ids = ((IEnumerable<Guid>)callInfo[0]).ToHashSet();
                var users = new[]
                {
                    MakeUser(_submitterAId, UserRole.Expat, "Submitter A", "a@example.com"),
                    MakeUser(_submitterBId, UserRole.Expat, "Submitter B", "b@example.com")
                };
                return users.Where(u => ids.Contains(u.Id));
            });
    }

    private EoiEntity MakeEoi(Guid submittedById, EoiVisibility visibility)
    {
        var eoi = EoiEntity.Create(Guid.NewGuid(), submittedById, "Message", _cfeoiId);
        if (visibility == EoiVisibility.Shared)
            eoi.SetVisibility(EoiVisibility.Shared);
        return eoi;
    }

    private static UserEntity MakeUser(Guid id, UserRole role, string fullName = "User", string email = "user@example.com")
        => UserEntity.Create(id, $"ext-{id}", email, fullName, role);

    private void CurrentUser(UserEntity? user)
        => _currentUserService.GetCurrentUserOrNullAsync(Arg.Any<CancellationToken>()).Returns(user);

    [Fact]
    public async Task Handle_Anonymous_ReturnsNothing()
    {
        CurrentUser(null);

        var result = await _handler.Handle(new ListEoisByCfeoiQuery(_cfeoiId), CancellationToken.None);

        Assert.Empty(result);
    }

    [Fact]
    public async Task Handle_Submitter_ReturnsOnlyOwnEois()
    {
        CurrentUser(MakeUser(_submitterAId, UserRole.Expat));

        var result = await _handler.Handle(new ListEoisByCfeoiQuery(_cfeoiId), CancellationToken.None);

        Assert.Equal(new[] { _privateByA.Id }, result.Select(e => e.Id));
    }

    [Fact]
    public async Task Handle_ProposalOwner_ReturnsSharedEoisOnly()
    {
        CurrentUser(MakeUser(_proposalOwnerId, UserRole.Expat));

        var result = await _handler.Handle(new ListEoisByCfeoiQuery(_cfeoiId), CancellationToken.None);

        Assert.Equal(new[] { _sharedByB.Id }, result.Select(e => e.Id));
    }

    [Fact]
    public async Task Handle_UnrelatedExpat_ReturnsNothing()
    {
        CurrentUser(MakeUser(Guid.NewGuid(), UserRole.Expat));

        var result = await _handler.Handle(new ListEoisByCfeoiQuery(_cfeoiId), CancellationToken.None);

        Assert.Empty(result);
    }

    [Theory]
    [InlineData(UserRole.Staff)]
    [InlineData(UserRole.OrganisationAdmin)]
    [InlineData(UserRole.SuperAdmin)]
    public async Task Handle_Staff_ReturnsAllEois(UserRole role)
    {
        CurrentUser(MakeUser(Guid.NewGuid(), role));

        var result = await _handler.Handle(new ListEoisByCfeoiQuery(_cfeoiId), CancellationToken.None);

        Assert.Equal(3, result.Count());
    }

    [Fact]
    public async Task Handle_ProposalOwner_IncludesSubmitterNameButNotEmail()
    {
        CurrentUser(MakeUser(_proposalOwnerId, UserRole.Expat));

        var result = await _handler.Handle(new ListEoisByCfeoiQuery(_cfeoiId), CancellationToken.None);
        var dto = Assert.Single(result);

        Assert.Equal("Submitter B", dto.SubmitterName);
        Assert.Null(dto.SubmitterEmail);
    }

    [Theory]
    [InlineData(UserRole.Staff)]
    [InlineData(UserRole.OrganisationAdmin)]
    [InlineData(UserRole.SuperAdmin)]
    public async Task Handle_Staff_IncludesSubmitterNameAndEmail(UserRole role)
    {
        CurrentUser(MakeUser(Guid.NewGuid(), role));

        var result = await _handler.Handle(new ListEoisByCfeoiQuery(_cfeoiId), CancellationToken.None);

        Assert.All(result, dto =>
        {
            Assert.False(string.IsNullOrEmpty(dto.SubmitterName));
            Assert.False(string.IsNullOrEmpty(dto.SubmitterEmail));
        });
    }
}
