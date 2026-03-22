using Herit.Application.Features.Organisation.Commands.CreateOrganisation;
using Herit.Application.Interfaces;
using NSubstitute;
using OrganisationEntity = Herit.Domain.Entities.Organisation;

namespace Herit.Application.Tests.Features.Organisation.Commands;

public class CreateOrganisationCommandHandlerTests
{
    private readonly IOrganisationRepository _repository = Substitute.For<IOrganisationRepository>();
    private readonly CreateOrganisationCommandHandler _handler;

    public CreateOrganisationCommandHandlerTests()
    {
        _handler = new CreateOrganisationCommandHandler(_repository);
    }

    [Fact]
    public async Task Handle_WithoutParent_CreatesOrganisationAndReturnsId()
    {
        var command = new CreateOrganisationCommand("Ministry of Finance");

        var result = await _handler.Handle(command, CancellationToken.None);

        Assert.NotEqual(Guid.Empty, result);
        await _repository.Received(1).AddAsync(
            Arg.Is<OrganisationEntity>(o => o.Name == "Ministry of Finance" && o.ParentId == null),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithValidParent_CreatesOrganisationWithParentId()
    {
        var parentId = Guid.NewGuid();
        var parent = OrganisationEntity.Create(parentId, "Parent Organisation");
        _repository.GetByIdAsync(parentId, Arg.Any<CancellationToken>()).Returns(parent);

        var command = new CreateOrganisationCommand("Child Organisation", parentId);

        var result = await _handler.Handle(command, CancellationToken.None);

        Assert.NotEqual(Guid.Empty, result);
        await _repository.Received(1).AddAsync(
            Arg.Is<OrganisationEntity>(o => o.Name == "Child Organisation" && o.ParentId == parentId),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithNonExistentParent_ThrowsInvalidOperationException()
    {
        var parentId = Guid.NewGuid();
        _repository.GetByIdAsync(parentId, Arg.Any<CancellationToken>()).Returns((OrganisationEntity?)null);

        var command = new CreateOrganisationCommand("Child Organisation", parentId);

        await Assert.ThrowsAsync<InvalidOperationException>(() => _handler.Handle(command, CancellationToken.None));
        await _repository.DidNotReceive().AddAsync(Arg.Any<OrganisationEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_CalledTwice_ReturnsDifferentIds()
    {
        var id1 = await _handler.Handle(new CreateOrganisationCommand("Org A"), CancellationToken.None);
        var id2 = await _handler.Handle(new CreateOrganisationCommand("Org B"), CancellationToken.None);

        Assert.NotEqual(id1, id2);
    }
}
