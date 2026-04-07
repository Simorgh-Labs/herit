using Herit.Application.Exceptions;
using Herit.Application.Features.User.Commands.CreateStaffUser;
using Herit.Application.Interfaces;
using NSubstitute;
using NSubstitute.ExceptionExtensions;
using OrganisationEntity = Herit.Domain.Entities.Organisation;
using UserEntity = Herit.Domain.Entities.User;

namespace Herit.Application.Tests.Features.User.Commands;

public class CreateStaffUserCommandHandlerTests
{
    private readonly IUserRepository _userRepository = Substitute.For<IUserRepository>();
    private readonly IOrganisationRepository _organisationRepository = Substitute.For<IOrganisationRepository>();
    private readonly IIdentityProviderService _identityProviderService = Substitute.For<IIdentityProviderService>();

    private readonly CreateStaffUserCommandHandler _handler;

    public CreateStaffUserCommandHandlerTests()
    {
        _handler = new CreateStaffUserCommandHandler(_userRepository, _organisationRepository, _identityProviderService);
    }

    [Fact]
    public async Task Handle_WithValidOrganisation_ReturnsNonEmptyGuid()
    {
        var orgId = Guid.NewGuid();
        var organisation = OrganisationEntity.Create(orgId, "Test Organisation");
        _organisationRepository.GetByIdAsync(orgId, Arg.Any<CancellationToken>()).Returns(organisation);
        _identityProviderService.CreateUserAsync("staff@gov.eg", "Staff Member", Arg.Any<CancellationToken>()).Returns("ext-staff-1");

        var command = new CreateStaffUserCommand("staff@gov.eg", "Staff Member", orgId);

        var result = await _handler.Handle(command, CancellationToken.None);

        Assert.NotEqual(Guid.Empty, result);
    }

    [Fact]
    public async Task Handle_WithValidOrganisation_CallsAddAsyncExactlyOnce()
    {
        var orgId = Guid.NewGuid();
        var organisation = OrganisationEntity.Create(orgId, "Test Organisation");
        _organisationRepository.GetByIdAsync(orgId, Arg.Any<CancellationToken>()).Returns(organisation);
        _identityProviderService.CreateUserAsync("staff@gov.eg", "Staff Member", Arg.Any<CancellationToken>()).Returns("ext-staff-1");

        var command = new CreateStaffUserCommand("staff@gov.eg", "Staff Member", orgId);

        await _handler.Handle(command, CancellationToken.None);

        await _userRepository.Received(1).AddAsync(
            Arg.Is<UserEntity>(u => u.Email == "staff@gov.eg" && u.FullName == "Staff Member" && u.OrganisationId == orgId),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithNonExistentOrganisation_ThrowsNotFoundException()
    {
        var orgId = Guid.NewGuid();
        _organisationRepository.GetByIdAsync(orgId, Arg.Any<CancellationToken>()).Returns((OrganisationEntity?)null);

        var command = new CreateStaffUserCommand("staff@gov.eg", "Staff Member", orgId);

        await Assert.ThrowsAsync<NotFoundException>(() => _handler.Handle(command, CancellationToken.None));
        await _userRepository.DidNotReceive().AddAsync(Arg.Any<UserEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenIdentityProviderCreationThrows_DoesNotWriteToDatabase()
    {
        var orgId = Guid.NewGuid();
        var organisation = OrganisationEntity.Create(orgId, "Test Organisation");
        _organisationRepository.GetByIdAsync(orgId, Arg.Any<CancellationToken>()).Returns(organisation);
        _identityProviderService.CreateUserAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CancellationToken>())
            .ThrowsAsync(new InvalidOperationException("Identity provider provisioning failed"));

        var command = new CreateStaffUserCommand("staff@gov.eg", "Staff Member", orgId);

        await Assert.ThrowsAsync<InvalidOperationException>(() => _handler.Handle(command, CancellationToken.None));
        await _userRepository.DidNotReceive().AddAsync(Arg.Any<UserEntity>(), Arg.Any<CancellationToken>());
    }
}
