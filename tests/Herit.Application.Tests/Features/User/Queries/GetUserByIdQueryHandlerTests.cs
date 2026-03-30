using Herit.Application.Exceptions;
using Herit.Application.Features.User.Queries.GetUserById;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using NSubstitute;
using UserEntity = Herit.Domain.Entities.User;

namespace Herit.Application.Tests.Features.User.Queries;

public class GetUserByIdQueryHandlerTests
{
    private readonly IUserRepository _userRepository = Substitute.For<IUserRepository>();
    private readonly GetUserByIdQueryHandler _handler;

    public GetUserByIdQueryHandlerTests()
    {
        _handler = new GetUserByIdQueryHandler(_userRepository);
    }

    [Fact]
    public async Task Handle_WhenRepositoryReturnsUser_ReturnsUser()
    {
        var userId = Guid.NewGuid();
        var user = UserEntity.Create(userId, "user@gov.eg", "Test User", UserRole.Staff);
        _userRepository.GetByIdAsync(userId, Arg.Any<CancellationToken>()).Returns(user);

        var query = new GetUserByIdQuery(userId);
        var result = await _handler.Handle(query, CancellationToken.None);

        Assert.Equal(user, result);
    }

    [Fact]
    public async Task Handle_WhenRepositoryReturnsNull_ThrowsNotFoundException()
    {
        var userId = Guid.NewGuid();
        _userRepository.GetByIdAsync(userId, Arg.Any<CancellationToken>()).Returns((UserEntity?)null);

        var query = new GetUserByIdQuery(userId);
        await Assert.ThrowsAsync<NotFoundException>(() => _handler.Handle(query, CancellationToken.None));
    }
}
