using Herit.Application.Exceptions;
using Herit.Application.Features.User.Commands.DeleteStaffUser;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using NSubstitute;
using NSubstitute.ExceptionExtensions;
using UserEntity = Herit.Domain.Entities.User;

namespace Herit.Application.Tests.Features.User.Commands;

public class DeleteStaffUserCommandHandlerTests
{
    private readonly IUserRepository _userRepository = Substitute.For<IUserRepository>();
    private readonly IIdentityProviderService _identityProviderService = Substitute.For<IIdentityProviderService>();
    private readonly DeleteStaffUserCommandHandler _handler;

    public DeleteStaffUserCommandHandlerTests()
    {
        _handler = new DeleteStaffUserCommandHandler(_userRepository, _identityProviderService);
    }

    [Fact]
    public async Task Handle_WithExistingStaffUser_CallsDeleteIdentityThenDeleteAsync()
    {
        var userId = Guid.NewGuid();
        var user = UserEntity.Create(userId, "ext-staff", "staff@gov.eg", "Staff User", UserRole.Staff, Guid.NewGuid());
        _userRepository.GetByIdAsync(userId, Arg.Any<CancellationToken>()).Returns(user);

        var command = new DeleteStaffUserCommand(userId);
        await _handler.Handle(command, CancellationToken.None);

        await _identityProviderService.Received(1).DeleteUserAsync("ext-staff", Arg.Any<CancellationToken>());
        await _userRepository.Received(1).DeleteAsync(userId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithNonExistentUser_ThrowsNotFoundException()
    {
        var userId = Guid.NewGuid();
        _userRepository.GetByIdAsync(userId, Arg.Any<CancellationToken>()).Returns((UserEntity?)null);

        var command = new DeleteStaffUserCommand(userId);

        await Assert.ThrowsAsync<NotFoundException>(() => _handler.Handle(command, CancellationToken.None));
        await _userRepository.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
        await _identityProviderService.DidNotReceive().DeleteUserAsync(Arg.Any<string>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithWrongRole_ThrowsInvalidOperationException()
    {
        var userId = Guid.NewGuid();
        var user = UserEntity.Create(userId, "ext-admin", "admin@gov.eg", "Org Admin", UserRole.OrganisationAdmin, Guid.NewGuid());
        _userRepository.GetByIdAsync(userId, Arg.Any<CancellationToken>()).Returns(user);

        var command = new DeleteStaffUserCommand(userId);

        await Assert.ThrowsAsync<InvalidOperationException>(() => _handler.Handle(command, CancellationToken.None));
        await _userRepository.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
        await _identityProviderService.DidNotReceive().DeleteUserAsync(Arg.Any<string>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenIdentityProviderDeletionThrows_DoesNotDeleteFromDatabase()
    {
        var userId = Guid.NewGuid();
        var user = UserEntity.Create(userId, "ext-staff", "staff@gov.eg", "Staff User", UserRole.Staff, Guid.NewGuid());
        _userRepository.GetByIdAsync(userId, Arg.Any<CancellationToken>()).Returns(user);
        _identityProviderService.DeleteUserAsync(Arg.Any<string>(), Arg.Any<CancellationToken>())
            .ThrowsAsync(new InvalidOperationException("Identity provider deletion failed"));

        var command = new DeleteStaffUserCommand(userId);

        await Assert.ThrowsAsync<InvalidOperationException>(() => _handler.Handle(command, CancellationToken.None));
        await _userRepository.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }
}
