using Herit.Application.Features.Rfp.Queries.ListRfps;
using Herit.Application.Interfaces;
using Herit.Domain.Entities;
using UserEntity = Herit.Domain.Entities.User;
using Herit.Domain.Enums;
using NSubstitute;
using RfpEntity = Herit.Domain.Entities.Rfp;

namespace Herit.Application.Tests.Features.Rfp.Queries;

public class ListRfpsQueryHandlerTests
{
    private readonly IRfpRepository _repository = Substitute.For<IRfpRepository>();
    private readonly ICurrentUserService _currentUserService = Substitute.For<ICurrentUserService>();
    private readonly ListRfpsQueryHandler _handler;

    private readonly RfpEntity _draft;
    private readonly RfpEntity _approved;
    private readonly RfpEntity _published;

    public ListRfpsQueryHandlerTests()
    {
        _handler = new ListRfpsQueryHandler(_repository, _currentUserService);

        _draft = MakeRfp(RfpStatus.Draft);
        _approved = MakeRfp(RfpStatus.Approved);
        _published = MakeRfp(RfpStatus.Published);

        _repository.ListAsync(Arg.Any<CancellationToken>())
            .Returns(new[] { _draft, _approved, _published });
    }

    private static RfpEntity MakeRfp(RfpStatus status)
    {
        var rfp = RfpEntity.Create(Guid.NewGuid(), "RFP", "Short", Guid.NewGuid(), Guid.NewGuid(), "Long");
        if (status is RfpStatus.Approved or RfpStatus.Published)
            rfp.TransitionStatus(RfpStatus.Approved);
        if (status is RfpStatus.Published)
            rfp.TransitionStatus(RfpStatus.Published);
        return rfp;
    }

    private static UserEntity MakeUser(UserRole role)
        => UserEntity.Create(Guid.NewGuid(), $"ext-{Guid.NewGuid()}", "user@example.com", "User", role);

    private void CurrentUser(UserEntity? user)
        => _currentUserService.GetCurrentUserOrNullAsync(Arg.Any<CancellationToken>()).Returns(user);

    [Fact]
    public async Task Handle_Anonymous_ReturnsOnlyPublished()
    {
        CurrentUser(null);

        var result = await _handler.Handle(new ListRfpsQuery(), CancellationToken.None);

        Assert.Equal(new[] { _published.Id }, result.Select(r => r.Id));
    }

    [Fact]
    public async Task Handle_Expat_ReturnsOnlyPublished()
    {
        CurrentUser(MakeUser(UserRole.Expat));

        var result = await _handler.Handle(new ListRfpsQuery(), CancellationToken.None);

        Assert.Equal(new[] { _published.Id }, result.Select(r => r.Id));
    }

    [Theory]
    [InlineData(UserRole.Staff)]
    [InlineData(UserRole.OrganisationAdmin)]
    [InlineData(UserRole.SuperAdmin)]
    public async Task Handle_Staff_ReturnsAllStatuses(UserRole role)
    {
        CurrentUser(MakeUser(role));

        var result = await _handler.Handle(new ListRfpsQuery(), CancellationToken.None);

        Assert.Equal(3, result.Count());
    }

    [Fact]
    public async Task Handle_EmptyList_ReturnsEmptyCollection()
    {
        _repository.ListAsync(Arg.Any<CancellationToken>()).Returns(Enumerable.Empty<RfpEntity>());
        CurrentUser(MakeUser(UserRole.Staff));

        var result = await _handler.Handle(new ListRfpsQuery(), CancellationToken.None);

        Assert.Empty(result);
    }
}
