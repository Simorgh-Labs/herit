using Herit.Application.Exceptions;
using Herit.Application.Features.Rfp.Commands.CreateRfp;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using NSubstitute;
using OrganisationEntity = Herit.Domain.Entities.Organisation;
using RfpEntity = Herit.Domain.Entities.Rfp;
using UserEntity = Herit.Domain.Entities.User;

namespace Herit.Application.Tests.Features.Rfp.Commands;

public class CreateRfpCommandHandlerTests
{
    private readonly IRfpRepository _rfpRepository = Substitute.For<IRfpRepository>();
    private readonly IUserRepository _userRepository = Substitute.For<IUserRepository>();
    private readonly IOrganisationRepository _organisationRepository = Substitute.For<IOrganisationRepository>();
    private readonly CreateRfpCommandHandler _handler;

    public CreateRfpCommandHandlerTests()
    {
        _handler = new CreateRfpCommandHandler(_rfpRepository, _userRepository, _organisationRepository);
    }

    [Fact]
    public async Task Handle_HappyPath_ReturnsValidGuidAndCallsAddAsync()
    {
        var authorId = Guid.NewGuid();
        var organisationId = Guid.NewGuid();
        _userRepository.GetByIdAsync(authorId, Arg.Any<CancellationToken>())
            .Returns(UserEntity.Create(authorId, "user@example.com", "Test User", UserRole.Staff));
        _organisationRepository.GetByIdAsync(organisationId, Arg.Any<CancellationToken>())
            .Returns(OrganisationEntity.Create(organisationId, "Test Org"));

        var command = new CreateRfpCommand("Title", "Short", authorId, organisationId, "Long");

        var result = await _handler.Handle(command, CancellationToken.None);

        Assert.NotEqual(Guid.Empty, result);
        await _rfpRepository.Received(1).AddAsync(
            Arg.Is<RfpEntity>(r => r.Title == "Title" && r.AuthorId == authorId && r.OrganisationId == organisationId),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_AuthorNotFound_ThrowsNotFoundException()
    {
        var authorId = Guid.NewGuid();
        var organisationId = Guid.NewGuid();
        _userRepository.GetByIdAsync(authorId, Arg.Any<CancellationToken>()).Returns((UserEntity?)null);

        var command = new CreateRfpCommand("Title", "Short", authorId, organisationId, "Long");

        await Assert.ThrowsAsync<NotFoundException>(() => _handler.Handle(command, CancellationToken.None));
        await _rfpRepository.DidNotReceive().AddAsync(Arg.Any<RfpEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_OrganisationNotFound_ThrowsNotFoundException()
    {
        var authorId = Guid.NewGuid();
        var organisationId = Guid.NewGuid();
        _userRepository.GetByIdAsync(authorId, Arg.Any<CancellationToken>())
            .Returns(UserEntity.Create(authorId, "user@example.com", "Test User", UserRole.Staff));
        _organisationRepository.GetByIdAsync(organisationId, Arg.Any<CancellationToken>()).Returns((OrganisationEntity?)null);

        var command = new CreateRfpCommand("Title", "Short", authorId, organisationId, "Long");

        await Assert.ThrowsAsync<NotFoundException>(() => _handler.Handle(command, CancellationToken.None));
        await _rfpRepository.DidNotReceive().AddAsync(Arg.Any<RfpEntity>(), Arg.Any<CancellationToken>());
    }
}
