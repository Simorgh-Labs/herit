using Herit.Application.Exceptions;
using Herit.Application.Features.User.Commands.CreateStaffUser;
using Herit.Application.Interfaces;
using NSubstitute;
using OrganisationEntity = Herit.Domain.Entities.Organisation;
using UserEntity = Herit.Domain.Entities.User;

namespace Herit.Application.Tests.Features.User.Commands;

public class CreateStaffUserCommandHandlerTests
{
    private readonly IUserRepository _userRepository = Substitute.For<IUserRepository>();
    private readonly IOrganisationRepository _organisationRepository = Substitute.For<IOrganisationRepository>();

    private readonly CreateStaffUserCommandHandler _handler;

    public CreateStaffUserCommandHandlerTests()
    {
        _handler = new CreateStaffUserCommandHandler(_userRepository, _organisationRepository);
    }

    [Fact]
    public async Task Handle_WithValidOrganisation_ReturnsNonEmptyGuid()
    {
        var orgId = Guid.NewGuid();
        var organisation = OrganisationEntity.Create(orgId, "Test Organisation");
        _organisationRepository.GetByIdAsync(orgId, Arg.Any<CancellationToken>()).Returns(organisation);

        var command = new CreateStaffUserCommand("ext-staff-1", "staff@gov.eg", "Staff Member", orgId);

        var result = await _handler.Handle(command, CancellationToken.None);

        Assert.NotEqual(Guid.Empty, result);
    }

    [Fact]
    public async Task Handle_WithValidOrganisation_CallsAddAsyncExactlyOnce()
    {
        var orgId = Guid.NewGuid();
        var organisation = OrganisationEntity.Create(orgId, "Test Organisation");
        _organisationRepository.GetByIdAsync(orgId, Arg.Any<CancellationToken>()).Returns(organisation);

        var command = new CreateStaffUserCommand("ext-staff-1", "staff@gov.eg", "Staff Member", orgId);

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

        var command = new CreateStaffUserCommand("ext-staff-1", "staff@gov.eg", "Staff Member", orgId);

        await Assert.ThrowsAsync<NotFoundException>(() => _handler.Handle(command, CancellationToken.None));
        await _userRepository.DidNotReceive().AddAsync(Arg.Any<UserEntity>(), Arg.Any<CancellationToken>());
    }
}
