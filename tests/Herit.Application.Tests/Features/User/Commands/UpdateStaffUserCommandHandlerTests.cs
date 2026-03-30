using Herit.Application.Exceptions;
using Herit.Application.Features.User.Commands.UpdateStaffUser;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using NSubstitute;
using UserEntity = Herit.Domain.Entities.User;

namespace Herit.Application.Tests.Features.User.Commands;

public class UpdateStaffUserCommandHandlerTests
{
    private readonly IUserRepository _userRepository = Substitute.For<IUserRepository>();
    private readonly UpdateStaffUserCommandHandler _handler;

    public UpdateStaffUserCommandHandlerTests()
    {
        _handler = new UpdateStaffUserCommandHandler(_userRepository);
    }

    [Fact]
    public async Task Handle_WithExistingUser_CallsUpdateAsyncExactlyOnce()
    {
        var userId = Guid.NewGuid();
        var user = UserEntity.Create(userId, "old@gov.eg", "Old Name", UserRole.Staff);
        _userRepository.GetByIdAsync(userId, Arg.Any<CancellationToken>()).Returns(user);

        var command = new UpdateStaffUserCommand(userId, "updated@gov.eg", "Updated Name");

        await _handler.Handle(command, CancellationToken.None);

        await _userRepository.Received(1).UpdateAsync(
            Arg.Is<UserEntity>(u => u.Id == userId && u.Email == "updated@gov.eg" && u.FullName == "Updated Name"),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithNonExistentUser_ThrowsNotFoundException()
    {
        var userId = Guid.NewGuid();
        _userRepository.GetByIdAsync(userId, Arg.Any<CancellationToken>()).Returns((UserEntity?)null);

        var command = new UpdateStaffUserCommand(userId, "updated@gov.eg", "Updated Name");

        await Assert.ThrowsAsync<NotFoundException>(() => _handler.Handle(command, CancellationToken.None));
        await _userRepository.DidNotReceive().UpdateAsync(Arg.Any<UserEntity>(), Arg.Any<CancellationToken>());
    }
}
