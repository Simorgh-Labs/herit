using Herit.Application.Exceptions;
using Herit.Application.Features.Eoi.Queries.GetEoiById;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using NSubstitute;
using EoiEntity = Herit.Domain.Entities.Eoi;
using UserEntity = Herit.Domain.Entities.User;

namespace Herit.Application.Tests.Features.Eoi.Queries;

public class GetEoiByIdQueryHandlerTests
{
    private readonly IEoiRepository _eoiRepository = Substitute.For<IEoiRepository>();
    private readonly IUserRepository _userRepository = Substitute.For<IUserRepository>();
    private readonly ICurrentUserService _currentUserService = Substitute.For<ICurrentUserService>();
    private readonly GetEoiByIdQueryHandler _handler;

    public GetEoiByIdQueryHandlerTests()
    {
        _handler = new GetEoiByIdQueryHandler(_eoiRepository, _userRepository, _currentUserService);
    }

    private static UserEntity MakeUser(Guid id, UserRole role, string fullName = "Submitter", string email = "submitter@example.com")
        => UserEntity.Create(id, $"ext-{id}", email, fullName, role);

    [Fact]
    public async Task Handle_EoiFound_ReturnsEoi()
    {
        var eoiId = Guid.NewGuid();
        var submitterId = Guid.NewGuid();
        var eoi = EoiEntity.Create(eoiId, submitterId, "Message", Guid.NewGuid());
        _eoiRepository.GetByIdAsync(eoiId, Arg.Any<CancellationToken>()).Returns(eoi);
        _userRepository.GetByIdAsync(submitterId, Arg.Any<CancellationToken>()).Returns(MakeUser(submitterId, UserRole.Expat));
        _currentUserService.GetCurrentUserOrNullAsync(Arg.Any<CancellationToken>()).Returns(MakeUser(submitterId, UserRole.Expat));

        var result = await _handler.Handle(new GetEoiByIdQuery(eoiId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(eoiId, result.Id);
    }

    [Fact]
    public async Task Handle_EoiNotFound_ThrowsNotFoundException()
    {
        var eoiId = Guid.NewGuid();
        _eoiRepository.GetByIdAsync(eoiId, Arg.Any<CancellationToken>()).Returns((EoiEntity?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => _handler.Handle(new GetEoiByIdQuery(eoiId), CancellationToken.None));
    }

    [Fact]
    public async Task Handle_StaffCaller_IncludesSubmitterEmail()
    {
        var eoiId = Guid.NewGuid();
        var submitterId = Guid.NewGuid();
        var eoi = EoiEntity.Create(eoiId, submitterId, "Message", Guid.NewGuid());
        _eoiRepository.GetByIdAsync(eoiId, Arg.Any<CancellationToken>()).Returns(eoi);
        _userRepository.GetByIdAsync(submitterId, Arg.Any<CancellationToken>())
            .Returns(MakeUser(submitterId, UserRole.Expat, "Jamie Submitter", "jamie@example.com"));
        _currentUserService.GetCurrentUserOrNullAsync(Arg.Any<CancellationToken>())
            .Returns(MakeUser(Guid.NewGuid(), UserRole.Staff));

        var result = await _handler.Handle(new GetEoiByIdQuery(eoiId), CancellationToken.None);

        Assert.Equal("Jamie Submitter", result.SubmitterName);
        Assert.Equal("jamie@example.com", result.SubmitterEmail);
    }

    [Fact]
    public async Task Handle_NonStaffCaller_DoesNotIncludeSubmitterEmail()
    {
        var eoiId = Guid.NewGuid();
        var submitterId = Guid.NewGuid();
        var eoi = EoiEntity.Create(eoiId, submitterId, "Message", Guid.NewGuid());
        _eoiRepository.GetByIdAsync(eoiId, Arg.Any<CancellationToken>()).Returns(eoi);
        _userRepository.GetByIdAsync(submitterId, Arg.Any<CancellationToken>())
            .Returns(MakeUser(submitterId, UserRole.Expat, "Jamie Submitter", "jamie@example.com"));
        _currentUserService.GetCurrentUserOrNullAsync(Arg.Any<CancellationToken>())
            .Returns(MakeUser(submitterId, UserRole.Expat));

        var result = await _handler.Handle(new GetEoiByIdQuery(eoiId), CancellationToken.None);

        Assert.Equal("Jamie Submitter", result.SubmitterName);
        Assert.Null(result.SubmitterEmail);
    }
}
