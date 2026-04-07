using Herit.Application.Interfaces;
using Herit.Application.Seeding;
using Herit.Domain.Enums;
using Microsoft.Extensions.Logging.Abstractions;
using NSubstitute;
using UserEntity = Herit.Domain.Entities.User;

namespace Herit.Application.Tests.Seeding;

public class SuperAdminSeederTests
{
    private readonly IUserRepository _userRepository = Substitute.For<IUserRepository>();
    private readonly IIdentityProviderService _identityProviderService = Substitute.For<IIdentityProviderService>();
    private readonly SuperAdminSeeder _seeder;

    public SuperAdminSeederTests()
    {
        _seeder = new SuperAdminSeeder(_userRepository, _identityProviderService, NullLogger<SuperAdminSeeder>.Instance);
    }

    [Fact]
    public async Task SeedAsync_WhenNoSuperAdminExists_CreatesB2cAccountAndDbRecord()
    {
        _userRepository.ListAsync(Arg.Any<CancellationToken>()).Returns([]);
        _identityProviderService.CreateUserAsync("admin@example.com", "Super Admin", Arg.Any<CancellationToken>())
            .Returns("ext-super-1");

        await _seeder.SeedAsync("admin@example.com", "Super Admin");

        await _identityProviderService.Received(1).CreateUserAsync("admin@example.com", "Super Admin", Arg.Any<CancellationToken>());
        await _userRepository.Received(1).AddAsync(
            Arg.Is<UserEntity>(u =>
                u.Email == "admin@example.com" &&
                u.FullName == "Super Admin" &&
                u.Role == UserRole.SuperAdmin &&
                u.ExternalId == "ext-super-1"),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task SeedAsync_WhenSuperAdminAlreadyExists_DoesNothing()
    {
        var existing = UserEntity.Create(Guid.NewGuid(), "ext-existing", "admin@example.com", "Super Admin", UserRole.SuperAdmin);
        _userRepository.ListAsync(Arg.Any<CancellationToken>()).Returns([existing]);

        await _seeder.SeedAsync("admin@example.com", "Super Admin");

        await _identityProviderService.DidNotReceive().CreateUserAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CancellationToken>());
        await _userRepository.DidNotReceive().AddAsync(Arg.Any<UserEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task SeedAsync_WhenOtherUsersExistButNoSuperAdmin_CreatesNewSuperAdmin()
    {
        var staff = UserEntity.Create(Guid.NewGuid(), "ext-staff", "staff@example.com", "Staff User", UserRole.Staff);
        _userRepository.ListAsync(Arg.Any<CancellationToken>()).Returns([staff]);
        _identityProviderService.CreateUserAsync("admin@example.com", "Super Admin", Arg.Any<CancellationToken>())
            .Returns("ext-super-1");

        await _seeder.SeedAsync("admin@example.com", "Super Admin");

        await _userRepository.Received(1).AddAsync(
            Arg.Is<UserEntity>(u => u.Role == UserRole.SuperAdmin),
            Arg.Any<CancellationToken>());
    }
}
