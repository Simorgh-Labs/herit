using Herit.Application.Features.Organisation.Queries.ListOrganisations;
using Herit.Application.Interfaces;
using NSubstitute;
using OrganisationEntity = Herit.Domain.Entities.Organisation;

namespace Herit.Application.Tests.Features.Organisation.Queries;

public class ListOrganisationsQueryHandlerTests
{
    private readonly IOrganisationRepository _repository = Substitute.For<IOrganisationRepository>();
    private readonly ListOrganisationsQueryHandler _handler;

    public ListOrganisationsQueryHandlerTests()
    {
        _handler = new ListOrganisationsQueryHandler(_repository);
    }

    [Fact]
    public async Task Handle_ReturnsAllOrganisations()
    {
        var organisations = new[]
        {
            OrganisationEntity.Create(Guid.NewGuid(), "Ministry of Finance"),
            OrganisationEntity.Create(Guid.NewGuid(), "Ministry of Health")
        };
        _repository.ListAsync(Arg.Any<CancellationToken>()).Returns(organisations.AsEnumerable());

        var result = await _handler.Handle(new ListOrganisationsQuery(), CancellationToken.None);

        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task Handle_WhenEmpty_ReturnsEmptyCollection()
    {
        _repository.ListAsync(Arg.Any<CancellationToken>()).Returns(Enumerable.Empty<OrganisationEntity>());

        var result = await _handler.Handle(new ListOrganisationsQuery(), CancellationToken.None);

        Assert.Empty(result);
    }

    [Fact]
    public async Task Handle_ReturnsOrganisationsWithCorrectNames()
    {
        var organisations = new[]
        {
            OrganisationEntity.Create(Guid.NewGuid(), "Ministry of Finance"),
            OrganisationEntity.Create(Guid.NewGuid(), "Ministry of Health")
        };
        _repository.ListAsync(Arg.Any<CancellationToken>()).Returns(organisations.AsEnumerable());

        var result = (await _handler.Handle(new ListOrganisationsQuery(), CancellationToken.None)).ToList();

        Assert.Contains(result, o => o.Name == "Ministry of Finance");
        Assert.Contains(result, o => o.Name == "Ministry of Health");
    }
}
