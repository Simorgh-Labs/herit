using Herit.Application.Features.User.Commands.DeleteOrganisationAdmin;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using NSubstitute;
using UserEntity = Herit.Domain.Entities.User;

namespace Herit.Application.Tests.Features.User.Commands;

public class DeleteOrganisationAdminCommandHandlerTests
{
    private readonly IUserRepository _userRepository = Substitute.For<IUserRepository>();
    private readonly DeleteOrganisationAdminCommandHandler _handler;

    public DeleteOrganisationAdminCommandHandlerTests()
    {
        _handler = new DeleteOrganisationAdminCommandHandler(_userRepository);
    }

    [Fact]
    public async Task Handle_WithExistingOrganisationAdmin_CallsDeleteAsyncOnce()
    {
        var userId = Guid.NewGuid();
        var user = UserEntity.Create(userId, "admin@gov.eg", "Org Admin", UserRole.OrganisationAdmin, Guid.NewGuid());
        _userRepository.GetByIdAsync(userId, Arg.Any<CancellationToken>()).Returns(user);

        var command = new DeleteOrganisationAdminCommand(userId);
        await _handler.Handle(command, CancellationToken.None);

        await _userRepository.Received(1).DeleteAsync(userId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithNonExistentUser_ThrowsInvalidOperationException()
    {
        var userId = Guid.NewGuid();
        _userRepository.GetByIdAsync(userId, Arg.Any<CancellationToken>()).Returns((UserEntity?)null);

        var command = new DeleteOrganisationAdminCommand(userId);

        await Assert.ThrowsAsync<InvalidOperationException>(() => _handler.Handle(command, CancellationToken.None));
        await _userRepository.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithWrongRole_ThrowsInvalidOperationException()
    {
        var userId = Guid.NewGuid();
        var user = UserEntity.Create(userId, "staff@gov.eg", "Staff User", UserRole.Staff, Guid.NewGuid());
        _userRepository.GetByIdAsync(userId, Arg.Any<CancellationToken>()).Returns(user);

        var command = new DeleteOrganisationAdminCommand(userId);

        await Assert.ThrowsAsync<InvalidOperationException>(() => _handler.Handle(command, CancellationToken.None));
        await _userRepository.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }
}
