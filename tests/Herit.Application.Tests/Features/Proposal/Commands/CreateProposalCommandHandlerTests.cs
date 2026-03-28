using Herit.Application.Features.Proposal.Commands.CreateProposal;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using NSubstitute;
using OrganisationEntity = Herit.Domain.Entities.Organisation;
using ProposalEntity = Herit.Domain.Entities.Proposal;
using RfpEntity = Herit.Domain.Entities.Rfp;
using UserEntity = Herit.Domain.Entities.User;

namespace Herit.Application.Tests.Features.Proposal.Commands;

public class CreateProposalCommandHandlerTests
{
    private readonly IProposalRepository _proposalRepository = Substitute.For<IProposalRepository>();
    private readonly IUserRepository _userRepository = Substitute.For<IUserRepository>();
    private readonly IOrganisationRepository _organisationRepository = Substitute.For<IOrganisationRepository>();
    private readonly IRfpRepository _rfpRepository = Substitute.For<IRfpRepository>();
    private readonly CreateProposalCommandHandler _handler;

    public CreateProposalCommandHandlerTests()
    {
        _handler = new CreateProposalCommandHandler(_proposalRepository, _userRepository, _organisationRepository, _rfpRepository);
    }

    [Fact]
    public async Task Handle_HappyPath_WithoutRfpId_ReturnsValidGuidAndCallsAddAsync()
    {
        var authorId = Guid.NewGuid();
        var organisationId = Guid.NewGuid();
        _userRepository.GetByIdAsync(authorId, Arg.Any<CancellationToken>())
            .Returns(UserEntity.Create(authorId, "user@example.com", "Test User", UserRole.Staff));
        _organisationRepository.GetByIdAsync(organisationId, Arg.Any<CancellationToken>())
            .Returns(OrganisationEntity.Create(organisationId, "Test Org"));

        var command = new CreateProposalCommand("Title", "Short", authorId, organisationId, "Long");

        var result = await _handler.Handle(command, CancellationToken.None);

        Assert.NotEqual(Guid.Empty, result);
        await _proposalRepository.Received(1).AddAsync(
            Arg.Is<ProposalEntity>(p => p.Title == "Title" && p.AuthorId == authorId && p.OrganisationId == organisationId && p.RfpId == null),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_HappyPath_WithValidRfpId_ReturnsValidGuidAndCallsAddAsync()
    {
        var authorId = Guid.NewGuid();
        var organisationId = Guid.NewGuid();
        var rfpId = Guid.NewGuid();
        _userRepository.GetByIdAsync(authorId, Arg.Any<CancellationToken>())
            .Returns(UserEntity.Create(authorId, "user@example.com", "Test User", UserRole.Staff));
        _organisationRepository.GetByIdAsync(organisationId, Arg.Any<CancellationToken>())
            .Returns(OrganisationEntity.Create(organisationId, "Test Org"));
        _rfpRepository.GetByIdAsync(rfpId, Arg.Any<CancellationToken>())
            .Returns(RfpEntity.Create(rfpId, "RFP", "Short", authorId, organisationId, "Long"));

        var command = new CreateProposalCommand("Title", "Short", authorId, organisationId, "Long", rfpId);

        var result = await _handler.Handle(command, CancellationToken.None);

        Assert.NotEqual(Guid.Empty, result);
        await _proposalRepository.Received(1).AddAsync(
            Arg.Is<ProposalEntity>(p => p.Title == "Title" && p.RfpId == rfpId),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_AuthorNotFound_ThrowsInvalidOperationException()
    {
        var authorId = Guid.NewGuid();
        var organisationId = Guid.NewGuid();
        _userRepository.GetByIdAsync(authorId, Arg.Any<CancellationToken>()).Returns((UserEntity?)null);

        var command = new CreateProposalCommand("Title", "Short", authorId, organisationId, "Long");

        await Assert.ThrowsAsync<InvalidOperationException>(() => _handler.Handle(command, CancellationToken.None));
        await _proposalRepository.DidNotReceive().AddAsync(Arg.Any<ProposalEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_OrganisationNotFound_ThrowsInvalidOperationException()
    {
        var authorId = Guid.NewGuid();
        var organisationId = Guid.NewGuid();
        _userRepository.GetByIdAsync(authorId, Arg.Any<CancellationToken>())
            .Returns(UserEntity.Create(authorId, "user@example.com", "Test User", UserRole.Staff));
        _organisationRepository.GetByIdAsync(organisationId, Arg.Any<CancellationToken>()).Returns((OrganisationEntity?)null);

        var command = new CreateProposalCommand("Title", "Short", authorId, organisationId, "Long");

        await Assert.ThrowsAsync<InvalidOperationException>(() => _handler.Handle(command, CancellationToken.None));
        await _proposalRepository.DidNotReceive().AddAsync(Arg.Any<ProposalEntity>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_RfpNotFound_ThrowsInvalidOperationException()
    {
        var authorId = Guid.NewGuid();
        var organisationId = Guid.NewGuid();
        var rfpId = Guid.NewGuid();
        _userRepository.GetByIdAsync(authorId, Arg.Any<CancellationToken>())
            .Returns(UserEntity.Create(authorId, "user@example.com", "Test User", UserRole.Staff));
        _organisationRepository.GetByIdAsync(organisationId, Arg.Any<CancellationToken>())
            .Returns(OrganisationEntity.Create(organisationId, "Test Org"));
        _rfpRepository.GetByIdAsync(rfpId, Arg.Any<CancellationToken>()).Returns((RfpEntity?)null);

        var command = new CreateProposalCommand("Title", "Short", authorId, organisationId, "Long", rfpId);

        await Assert.ThrowsAsync<InvalidOperationException>(() => _handler.Handle(command, CancellationToken.None));
        await _proposalRepository.DidNotReceive().AddAsync(Arg.Any<ProposalEntity>(), Arg.Any<CancellationToken>());
    }
}
