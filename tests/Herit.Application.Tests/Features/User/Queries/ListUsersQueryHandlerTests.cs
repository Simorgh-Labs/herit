using Herit.Application.Features.User.Queries.ListUsers;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using NSubstitute;
using UserEntity = Herit.Domain.Entities.User;

namespace Herit.Application.Tests.Features.User.Queries;

public class ListUsersQueryHandlerTests
{
    private readonly IUserRepository _userRepository = Substitute.For<IUserRepository>();
    private readonly ListUsersQueryHandler _handler;

    public ListUsersQueryHandlerTests()
    {
        _handler = new ListUsersQueryHandler(_userRepository);
    }

    [Fact]
    public async Task Handle_WhenRepositoryReturnsUsers_ReturnsAllUsers()
    {
        var users = new List<UserEntity>
        {
            UserEntity.Create(Guid.NewGuid(), "user1@gov.eg", "User One", UserRole.Staff),
            UserEntity.Create(Guid.NewGuid(), "user2@gov.eg", "User Two", UserRole.Staff),
        };
        _userRepository.ListAsync(Arg.Any<CancellationToken>()).Returns(users);

        var result = await _handler.Handle(new ListUsersQuery(), CancellationToken.None);

        Assert.Equal(users, result);
    }

    [Fact]
    public async Task Handle_WhenRepositoryReturnsEmpty_ReturnsEmptyCollection()
    {
        _userRepository.ListAsync(Arg.Any<CancellationToken>()).Returns(Enumerable.Empty<UserEntity>());

        var result = await _handler.Handle(new ListUsersQuery(), CancellationToken.None);

        Assert.Empty(result);
    }
}
