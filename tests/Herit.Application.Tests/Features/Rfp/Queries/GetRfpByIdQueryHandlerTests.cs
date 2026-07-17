using Herit.Application.Exceptions;
using Herit.Application.Features.Rfp.Queries.GetRfpById;
using Herit.Application.Interfaces;
using NSubstitute;
using OrganisationEntity = Herit.Domain.Entities.Organisation;
using RfpEntity = Herit.Domain.Entities.Rfp;
using UserEntity = Herit.Domain.Entities.User;
using Herit.Domain.Enums;

namespace Herit.Application.Tests.Features.Rfp.Queries;

public class GetRfpByIdQueryHandlerTests
{
    private readonly IRfpRepository _repository = Substitute.For<IRfpRepository>();
    private readonly IUserRepository _userRepository = Substitute.For<IUserRepository>();
    private readonly IOrganisationRepository _organisationRepository = Substitute.For<IOrganisationRepository>();
    private readonly GetRfpByIdQueryHandler _handler;

    public GetRfpByIdQueryHandlerTests()
    {
        _handler = new GetRfpByIdQueryHandler(_repository, _userRepository, _organisationRepository);
    }

    [Fact]
    public async Task Handle_WhenRfpExists_ReturnsRfpWithAuthorAndOrganisationName()
    {
        var id = Guid.NewGuid();
        var authorId = Guid.NewGuid();
        var organisationId = Guid.NewGuid();
        var rfp = RfpEntity.Create(id, "Title", "Short", authorId, organisationId, "Long");
        var author = UserEntity.Create(authorId, "ext-1", "author@example.com", "Author Name", UserRole.Staff);
        var organisation = OrganisationEntity.Create(organisationId, "Acme Org");

        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(rfp);
        _userRepository.GetByIdAsync(authorId, Arg.Any<CancellationToken>()).Returns(author);
        _organisationRepository.GetByIdAsync(organisationId, Arg.Any<CancellationToken>()).Returns(organisation);

        var result = await _handler.Handle(new GetRfpByIdQuery(id), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(id, result.Id);
        Assert.Equal("Author Name", result.AuthorName);
        Assert.Equal("Acme Org", result.OrganisationName);
    }

    [Fact]
    public async Task Handle_AuthorOrOrganisationMissing_FallsBackToPlaceholderNames()
    {
        var id = Guid.NewGuid();
        var rfp = RfpEntity.Create(id, "Title", "Short", Guid.NewGuid(), Guid.NewGuid(), "Long");

        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(rfp);
        _userRepository.GetByIdAsync(rfp.AuthorId, Arg.Any<CancellationToken>()).Returns((UserEntity?)null);
        _organisationRepository.GetByIdAsync(rfp.OrganisationId, Arg.Any<CancellationToken>()).Returns((OrganisationEntity?)null);

        var result = await _handler.Handle(new GetRfpByIdQuery(id), CancellationToken.None);

        Assert.Equal("Unknown author", result.AuthorName);
        Assert.Equal("Unknown organisation", result.OrganisationName);
    }

    [Fact]
    public async Task Handle_WhenRfpNotFound_ThrowsNotFoundException()
    {
        var id = Guid.NewGuid();
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns((RfpEntity?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => _handler.Handle(new GetRfpByIdQuery(id), CancellationToken.None));
    }
}
