using Herit.Application.Exceptions;
using Herit.Application.Features.Organisation.Commands.DeleteOrganisation;
using Herit.Application.Interfaces;
using NSubstitute;
using OrganisationEntity = Herit.Domain.Entities.Organisation;

namespace Herit.Application.Tests.Features.Organisation.Commands;

public class DeleteOrganisationCommandHandlerTests
{
    private readonly IOrganisationRepository _repository = Substitute.For<IOrganisationRepository>();
    private readonly DeleteOrganisationCommandHandler _handler;

    public DeleteOrganisationCommandHandlerTests()
    {
        _handler = new DeleteOrganisationCommandHandler(_repository);
    }

    [Fact]
    public async Task Handle_WithExistingOrganisation_DeletesAndReturnsUnit()
    {
        var id = Guid.NewGuid();
        var organisation = OrganisationEntity.Create(id, "Ministry of Finance");
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(organisation);

        var command = new DeleteOrganisationCommand(id);
        var result = await _handler.Handle(command, CancellationToken.None);

        Assert.Equal(MediatR.Unit.Value, result);
        await _repository.Received(1).DeleteAsync(id, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithNonExistentOrganisation_ThrowsNotFoundException()
    {
        var id = Guid.NewGuid();
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns((OrganisationEntity?)null);

        var command = new DeleteOrganisationCommand(id);

        await Assert.ThrowsAsync<NotFoundException>(() => _handler.Handle(command, CancellationToken.None));
        await _repository.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_DeletesUsingCommandId()
    {
        var id = Guid.NewGuid();
        var organisation = OrganisationEntity.Create(id, "Ministry of Finance");
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(organisation);

        await _handler.Handle(new DeleteOrganisationCommand(id), CancellationToken.None);

        await _repository.Received(1).DeleteAsync(id, Arg.Any<CancellationToken>());
    }
}
