using Herit.Application.Exceptions;
using Herit.Application.Features.User.Commands.UpdateUserProfile;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using NSubstitute;
using UserEntity = Herit.Domain.Entities.User;

namespace Herit.Application.Tests.Features.User.Commands;

public class UpdateUserProfileCommandHandlerTests
{
    private readonly IUserRepository _userRepository = Substitute.For<IUserRepository>();
    private readonly UpdateUserProfileCommandHandler _handler;

    public UpdateUserProfileCommandHandlerTests()
    {
        _handler = new UpdateUserProfileCommandHandler(_userRepository);
    }

    private static UserEntity CreateExpat(Guid id) =>
        UserEntity.Create(id, "expat@example.com", "Jane Doe", UserRole.Expat);

    [Fact]
    public async Task Handle_HappyPath_UpdatesProfileAndCallsUpdateAsync()
    {
        var id = Guid.NewGuid();
        var user = CreateExpat(id);
        _userRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(user);
        var termsAt = DateTimeOffset.UtcNow;

        var command = new UpdateUserProfileCommand(id, "Australian", "Sydney, AU", "C#,Azure", termsAt);

        var result = await _handler.Handle(command, CancellationToken.None);

        Assert.Equal(MediatR.Unit.Value, result);
        Assert.Equal("Australian", user.Nationality);
        Assert.Equal("Sydney, AU", user.Location);
        Assert.Equal("C#,Azure", user.ExpertiseTags);
        Assert.Equal(termsAt, user.TermsAcceptedAt);
        await _userRepository.Received(1).UpdateAsync(user, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_UserNotFound_ThrowsNotFoundException()
    {
        var id = Guid.NewGuid();
        _userRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns((UserEntity?)null);

        var command = new UpdateUserProfileCommand(id);

        await Assert.ThrowsAsync<NotFoundException>(() => _handler.Handle(command, CancellationToken.None));
        await _userRepository.DidNotReceive().UpdateAsync(Arg.Any<UserEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_NullFields_ClearsProfileValues()
    {
        var id = Guid.NewGuid();
        var user = UserEntity.Create(id, "expat@example.com", "Jane Doe", UserRole.Expat,
            nationality: "Australian", location: "Sydney");
        _userRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(user);

        var command = new UpdateUserProfileCommand(id);

        await _handler.Handle(command, CancellationToken.None);

        Assert.Null(user.Nationality);
        Assert.Null(user.Location);
    }
}
