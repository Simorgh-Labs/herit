using Herit.Application.Features.Organisation.Queries.GetOrganisationById;
using Herit.Application.Interfaces;
using NSubstitute;
using OrganisationEntity = Herit.Domain.Entities.Organisation;

namespace Herit.Application.Tests.Features.Organisation.Queries;

public class GetOrganisationByIdQueryHandlerTests
{
    private readonly IOrganisationRepository _repository = Substitute.For<IOrganisationRepository>();
    private readonly GetOrganisationByIdQueryHandler _handler;

    public GetOrganisationByIdQueryHandlerTests()
    {
        _handler = new GetOrganisationByIdQueryHandler(_repository);
    }

    [Fact]
    public async Task Handle_WithExistingId_ReturnsOrganisation()
    {
        var id = Guid.NewGuid();
        var organisation = OrganisationEntity.Create(id, "Ministry of Finance");
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(organisation);

        var result = await _handler.Handle(new GetOrganisationByIdQuery(id), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(id, result.Id);
        Assert.Equal("Ministry of Finance", result.Name);
    }

    [Fact]
    public async Task Handle_WithNonExistentId_ReturnsNull()
    {
        var id = Guid.NewGuid();
        _repository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns((OrganisationEntity?)null);

        var result = await _handler.Handle(new GetOrganisationByIdQuery(id), CancellationToken.None);

        Assert.Null(result);
    }
}
