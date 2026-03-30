using Herit.Application.Exceptions;
using Herit.Application.Features.Organisation.Commands.UpdateOrganisation;
using Herit.Application.Interfaces;
using NSubstitute;
using OrganisationEntity = Herit.Domain.Entities.Organisation;

namespace Herit.Application.Tests.Features.Organisation.Commands;

public class UpdateOrganisationCommandHandlerTests
{
    private readonly IOrganisationRepository _repository = Substitute.For<IOrganisationRepository>();
    private readonly UpdateOrganisationCommandHandler _handler;

    public UpdateOrganisationCommandHandlerTests()
    {
        _handler = new UpdateOrganisationCommandHandler(_repository);
    }

    [Fact]
    public async Task Handle_WithExistingOrganisation_UpdatesNameAndReturnsUnit()
    {
        var id = Guid.NewGuid();
        var organisation = OrganisationEntity.Create(id, "Old Name");
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(organisation);

        var command = new UpdateOrganisationCommand(id, "New Name");
        var result = await _handler.Handle(command, CancellationToken.None);

        Assert.Equal(MediatR.Unit.Value, result);
        Assert.Equal("New Name", organisation.Name);
        await _repository.Received(1).UpdateAsync(organisation, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithNonExistentOrganisation_ThrowsNotFoundException()
    {
        var id = Guid.NewGuid();
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns((OrganisationEntity?)null);

        var command = new UpdateOrganisationCommand(id, "New Name");

        await Assert.ThrowsAsync<NotFoundException>(() => _handler.Handle(command, CancellationToken.None));
        await _repository.DidNotReceive().UpdateAsync(Arg.Any<OrganisationEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_LooksUpOrganisationByCommandId()
    {
        var id = Guid.NewGuid();
        var organisation = OrganisationEntity.Create(id, "Old Name");
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(organisation);

        await _handler.Handle(new UpdateOrganisationCommand(id, "New Name"), CancellationToken.None);

        await _repository.Received(1).GetByIdAsync(id, Arg.Any<CancellationToken>());
    }
}
