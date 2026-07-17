using Herit.Application.Features.Eoi.Queries.ListEoisByUser;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using NSubstitute;
using EoiEntity = Herit.Domain.Entities.Eoi;
using UserEntity = Herit.Domain.Entities.User;

namespace Herit.Application.Tests.Features.Eoi.Queries;

public class ListEoisByUserQueryHandlerTests
{
    private readonly IEoiRepository _eoiRepository = Substitute.For<IEoiRepository>();
    private readonly IUserRepository _userRepository = Substitute.For<IUserRepository>();
    private readonly ICurrentUserService _currentUserService = Substitute.For<ICurrentUserService>();
    private readonly ListEoisByUserQueryHandler _handler;

    public ListEoisByUserQueryHandlerTests()
    {
        _handler = new ListEoisByUserQueryHandler(_eoiRepository, _userRepository, _currentUserService);
    }

    private static UserEntity MakeUser(Guid id, UserRole role, string fullName = "Submitter", string email = "submitter@example.com")
        => UserEntity.Create(id, $"ext-{id}", email, fullName, role);

    [Fact]
    public async Task Handle_NonEmptyList_ReturnsAllEoisForUser()
    {
        var userId = Guid.NewGuid();
        var eois = new[]
        {
            EoiEntity.Create(Guid.NewGuid(), userId, "Message 1", Guid.NewGuid()),
            EoiEntity.Create(Guid.NewGuid(), userId, "Message 2", Guid.NewGuid())
        };
        _eoiRepository.ListByUserAsync(userId, Arg.Any<CancellationToken>()).Returns(eois);
        _userRepository.GetByIdAsync(userId, Arg.Any<CancellationToken>()).Returns(MakeUser(userId, UserRole.Expat));
        _currentUserService.GetCurrentUserOrNullAsync(Arg.Any<CancellationToken>()).Returns(MakeUser(userId, UserRole.Expat));

        var result = await _handler.Handle(new ListEoisByUserQuery(userId), CancellationToken.None);

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task Handle_EmptyList_ReturnsEmptyEnumerable()
    {
        var userId = Guid.NewGuid();
        _eoiRepository.ListByUserAsync(userId, Arg.Any<CancellationToken>()).Returns(Enumerable.Empty<EoiEntity>());
        _userRepository.GetByIdAsync(userId, Arg.Any<CancellationToken>()).Returns(MakeUser(userId, UserRole.Expat));
        _currentUserService.GetCurrentUserOrNullAsync(Arg.Any<CancellationToken>()).Returns(MakeUser(userId, UserRole.Expat));

        var result = await _handler.Handle(new ListEoisByUserQuery(userId), CancellationToken.None);

        Assert.Empty(result);
    }

    [Fact]
    public async Task Handle_IncludesSubmitterName()
    {
        var userId = Guid.NewGuid();
        var eois = new[] { EoiEntity.Create(Guid.NewGuid(), userId, "Message", Guid.NewGuid()) };
        _eoiRepository.ListByUserAsync(userId, Arg.Any<CancellationToken>()).Returns(eois);
        _userRepository.GetByIdAsync(userId, Arg.Any<CancellationToken>())
            .Returns(MakeUser(userId, UserRole.Expat, "Jamie Submitter"));
        _currentUserService.GetCurrentUserOrNullAsync(Arg.Any<CancellationToken>())
            .Returns(MakeUser(userId, UserRole.Expat));

        var result = await _handler.Handle(new ListEoisByUserQuery(userId), CancellationToken.None);

        Assert.Equal("Jamie Submitter", Assert.Single(result).SubmitterName);
    }

    [Fact]
    public async Task Handle_NonStaffCaller_DoesNotIncludeSubmitterEmail()
    {
        var userId = Guid.NewGuid();
        var eois = new[] { EoiEntity.Create(Guid.NewGuid(), userId, "Message", Guid.NewGuid()) };
        _eoiRepository.ListByUserAsync(userId, Arg.Any<CancellationToken>()).Returns(eois);
        _userRepository.GetByIdAsync(userId, Arg.Any<CancellationToken>())
            .Returns(MakeUser(userId, UserRole.Expat));
        _currentUserService.GetCurrentUserOrNullAsync(Arg.Any<CancellationToken>())
            .Returns(MakeUser(userId, UserRole.Expat));

        var result = await _handler.Handle(new ListEoisByUserQuery(userId), CancellationToken.None);

        Assert.Null(Assert.Single(result).SubmitterEmail);
    }
}
