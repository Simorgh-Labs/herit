using Herit.Application.Features.User.Commands.RegisterExpat;
using Herit.Application.Interfaces;
using Herit.Domain.Enums;
using NSubstitute;
using UserEntity = Herit.Domain.Entities.User;

namespace Herit.Application.Tests.Features.User.Commands;

public class RegisterExpatCommandHandlerTests
{
    private readonly IUserRepository _userRepository = Substitute.For<IUserRepository>();
    private readonly RegisterExpatCommandHandler _handler;

    public RegisterExpatCommandHandlerTests()
    {
        _handler = new RegisterExpatCommandHandler(_userRepository);
    }

    [Fact]
    public async Task Handle_ReturnsNonEmptyGuid()
    {
        var command = new RegisterExpatCommand("ext-123", "expat@example.com", "Jane Doe");

        var result = await _handler.Handle(command, CancellationToken.None);

        Assert.NotEqual(Guid.Empty, result);
    }

    [Fact]
    public async Task Handle_CallsAddAsyncExactlyOnce()
    {
        var command = new RegisterExpatCommand("ext-123", "expat@example.com", "Jane Doe");

        await _handler.Handle(command, CancellationToken.None);

        await _userRepository.Received(1).AddAsync(
            Arg.Any<UserEntity>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_CreatesUserWithExpatRoleAndNullOrganisationId()
    {
        var command = new RegisterExpatCommand("ext-123", "expat@example.com", "Jane Doe");
        UserEntity? capturedUser = null;

        await _userRepository.AddAsync(
            Arg.Do<UserEntity>(u => capturedUser = u),
            Arg.Any<CancellationToken>());

        await _handler.Handle(command, CancellationToken.None);

        Assert.NotNull(capturedUser);
        Assert.Equal(UserRole.Expat, capturedUser.Role);
        Assert.Null(capturedUser.OrganisationId);
    }

    [Fact]
    public async Task Handle_PersistsOptionalProfileFields()
    {
        var termsAt = DateTimeOffset.UtcNow;
        var command = new RegisterExpatCommand(
            "ext-123", "expat@example.com", "Jane Doe",
            Nationality: "Australian",
            Location: "Sydney, AU",
            ExpertiseTags: "C#,Azure",
            TermsAcceptedAt: termsAt);
        UserEntity? capturedUser = null;

        await _userRepository.AddAsync(
            Arg.Do<UserEntity>(u => capturedUser = u),
            Arg.Any<CancellationToken>());

        await _handler.Handle(command, CancellationToken.None);

        Assert.NotNull(capturedUser);
        Assert.Equal("Australian", capturedUser.Nationality);
        Assert.Equal("Sydney, AU", capturedUser.Location);
        Assert.Equal("C#,Azure", capturedUser.ExpertiseTags);
        Assert.Equal(termsAt, capturedUser.TermsAcceptedAt);
    }
}
