using Herit.Application.Exceptions;
using Herit.Application.Features.Proposal.Queries.GetProposalById;
using Herit.Application.Interfaces;
using NSubstitute;
using OrganisationEntity = Herit.Domain.Entities.Organisation;
using ProposalEntity = Herit.Domain.Entities.Proposal;
using UserEntity = Herit.Domain.Entities.User;
using Herit.Domain.Enums;

namespace Herit.Application.Tests.Features.Proposal.Queries;

public class GetProposalByIdQueryHandlerTests
{
    private readonly IProposalRepository _proposalRepository = Substitute.For<IProposalRepository>();
    private readonly IUserRepository _userRepository = Substitute.For<IUserRepository>();
    private readonly IOrganisationRepository _organisationRepository = Substitute.For<IOrganisationRepository>();
    private readonly GetProposalByIdQueryHandler _handler;

    public GetProposalByIdQueryHandlerTests()
    {
        _handler = new GetProposalByIdQueryHandler(_proposalRepository, _userRepository, _organisationRepository);
    }

    [Fact]
    public async Task Handle_ProposalFound_ReturnsProposalWithAuthorAndOrganisationName()
    {
        var proposalId = Guid.NewGuid();
        var authorId = Guid.NewGuid();
        var organisationId = Guid.NewGuid();
        var proposal = ProposalEntity.Create(proposalId, "Title", "Short", authorId, organisationId, "Long");
        var author = UserEntity.Create(authorId, "ext-1", "author@example.com", "Author Name", UserRole.Expat);
        var organisation = OrganisationEntity.Create(organisationId, "Acme Org");

        _proposalRepository.GetByIdAsync(proposalId, Arg.Any<CancellationToken>()).Returns(proposal);
        _userRepository.GetByIdAsync(authorId, Arg.Any<CancellationToken>()).Returns(author);
        _organisationRepository.GetByIdAsync(organisationId, Arg.Any<CancellationToken>()).Returns(organisation);

        var result = await _handler.Handle(new GetProposalByIdQuery(proposalId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(proposalId, result.Id);
        Assert.Equal("Author Name", result.AuthorName);
        Assert.Equal("Acme Org", result.OrganisationName);
    }

    [Fact]
    public async Task Handle_AuthorOrOrganisationMissing_FallsBackToPlaceholderNames()
    {
        var proposalId = Guid.NewGuid();
        var proposal = ProposalEntity.Create(proposalId, "Title", "Short", Guid.NewGuid(), Guid.NewGuid(), "Long");

        _proposalRepository.GetByIdAsync(proposalId, Arg.Any<CancellationToken>()).Returns(proposal);
        _userRepository.GetByIdAsync(proposal.AuthorId, Arg.Any<CancellationToken>()).Returns((UserEntity?)null);
        _organisationRepository.GetByIdAsync(proposal.OrganisationId, Arg.Any<CancellationToken>()).Returns((OrganisationEntity?)null);

        var result = await _handler.Handle(new GetProposalByIdQuery(proposalId), CancellationToken.None);

        Assert.Equal("Unknown author", result.AuthorName);
        Assert.Equal("Unknown organisation", result.OrganisationName);
    }

    [Fact]
    public async Task Handle_ProposalNotFound_ThrowsNotFoundException()
    {
        var proposalId = Guid.NewGuid();
        _proposalRepository.GetByIdAsync(proposalId, Arg.Any<CancellationToken>()).Returns((ProposalEntity?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => _handler.Handle(new GetProposalByIdQuery(proposalId), CancellationToken.None));
    }
}
