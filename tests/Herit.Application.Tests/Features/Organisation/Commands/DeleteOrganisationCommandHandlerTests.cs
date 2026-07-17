using Herit.Application.Exceptions;
using Herit.Application.Features.Organisation.Commands.DeleteOrganisation;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using NSubstitute;
using OrganisationEntity = Herit.Domain.Entities.Organisation;
using ProposalEntity = Herit.Domain.Entities.Proposal;
using RfpEntity = Herit.Domain.Entities.Rfp;
using UserEntity = Herit.Domain.Entities.User;

namespace Herit.Application.Tests.Features.Organisation.Commands;

public class DeleteOrganisationCommandHandlerTests
{
    private readonly IOrganisationRepository _repository = Substitute.For<IOrganisationRepository>();
    private readonly IUserRepository _userRepository = Substitute.For<IUserRepository>();
    private readonly IRfpRepository _rfpRepository = Substitute.For<IRfpRepository>();
    private readonly IProposalRepository _proposalRepository = Substitute.For<IProposalRepository>();
    private readonly DeleteOrganisationCommandHandler _handler;

    public DeleteOrganisationCommandHandlerTests()
    {
        _handler = new DeleteOrganisationCommandHandler(_repository, _userRepository, _rfpRepository, _proposalRepository);

        _userRepository.ListAsync(Arg.Any<CancellationToken>()).Returns(Enumerable.Empty<UserEntity>());
        _repository.ListAsync(Arg.Any<CancellationToken>()).Returns(Enumerable.Empty<OrganisationEntity>());
        _rfpRepository.ListAsync(Arg.Any<CancellationToken>()).Returns(Enumerable.Empty<RfpEntity>());
        _proposalRepository.ListAsync(Arg.Any<CancellationToken>()).Returns(Enumerable.Empty<ProposalEntity>());
    }

    [Fact]
    public async Task Handle_WithExistingEmptyOrganisation_DeletesAndReturnsUnit()
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

    [Fact]
    public async Task Handle_WithAttachedUser_ThrowsConflictException()
    {
        var id = Guid.NewGuid();
        var organisation = OrganisationEntity.Create(id, "Ministry of Finance");
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(organisation);
        var attachedUser = UserEntity.Create(Guid.NewGuid(), "ext-1", "user@example.com", "Test User", UserRole.Staff, id);
        _userRepository.ListAsync(Arg.Any<CancellationToken>()).Returns([attachedUser]);

        await Assert.ThrowsAsync<ConflictException>(() => _handler.Handle(new DeleteOrganisationCommand(id), CancellationToken.None));
        await _repository.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithChildOrganisation_ThrowsConflictException()
    {
        var id = Guid.NewGuid();
        var organisation = OrganisationEntity.Create(id, "Ministry of Finance");
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(organisation);
        var child = OrganisationEntity.Create(Guid.NewGuid(), "Child Org", id);
        _repository.ListAsync(Arg.Any<CancellationToken>()).Returns([child]);

        await Assert.ThrowsAsync<ConflictException>(() => _handler.Handle(new DeleteOrganisationCommand(id), CancellationToken.None));
        await _repository.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithAttachedRfp_ThrowsConflictException()
    {
        var id = Guid.NewGuid();
        var organisation = OrganisationEntity.Create(id, "Ministry of Finance");
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(organisation);
        var rfp = RfpEntity.Create(Guid.NewGuid(), "Title", "Short", Guid.NewGuid(), id, "Long");
        _rfpRepository.ListAsync(Arg.Any<CancellationToken>()).Returns([rfp]);

        await Assert.ThrowsAsync<ConflictException>(() => _handler.Handle(new DeleteOrganisationCommand(id), CancellationToken.None));
        await _repository.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithAttachedProposal_ThrowsConflictException()
    {
        var id = Guid.NewGuid();
        var organisation = OrganisationEntity.Create(id, "Ministry of Finance");
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(organisation);
        var proposal = ProposalEntity.Create(Guid.NewGuid(), "Title", "Short", Guid.NewGuid(), id, "Long");
        _proposalRepository.ListAsync(Arg.Any<CancellationToken>()).Returns([proposal]);

        await Assert.ThrowsAsync<ConflictException>(() => _handler.Handle(new DeleteOrganisationCommand(id), CancellationToken.None));
        await _repository.DidNotReceive().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }
}
