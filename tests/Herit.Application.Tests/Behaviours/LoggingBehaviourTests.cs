using Herit.Application.Behaviours;
using MediatR;
using Microsoft.Extensions.Logging;
using NSubstitute;

namespace Herit.Application.Tests.Behaviours;

public class LoggingBehaviourTests
{
    public record TestRequest(string Value) : IRequest<string>;

    [Fact]
    public async Task Handle_Success_LogsDebugBeforeAndAfter()
    {
        var logger = Substitute.For<ILogger<LoggingBehaviour<TestRequest, string>>>();
        var behaviour = new LoggingBehaviour<TestRequest, string>(logger);
        var next = Substitute.For<RequestHandlerDelegate<string>>();
        next(Arg.Any<CancellationToken>()).Returns("result");

        var result = await behaviour.Handle(new TestRequest("value"), next, CancellationToken.None);

        Assert.Equal("result", result);
        logger.Received(2).Log(
            LogLevel.Debug,
            Arg.Any<EventId>(),
            Arg.Any<object>(),
            Arg.Any<Exception?>(),
            Arg.Any<Func<object, Exception?, string>>());
    }

    [Fact]
    public async Task Handle_Exception_LogsErrorAndRethrows()
    {
        var logger = Substitute.For<ILogger<LoggingBehaviour<TestRequest, string>>>();
        var behaviour = new LoggingBehaviour<TestRequest, string>(logger);
        var next = Substitute.For<RequestHandlerDelegate<string>>();
        var exception = new InvalidOperationException("boom");
        next(Arg.Any<CancellationToken>()).Returns<string>(_ => throw exception);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            behaviour.Handle(new TestRequest("value"), next, CancellationToken.None));

        logger.Received(1).Log(
            LogLevel.Debug,
            Arg.Any<EventId>(),
            Arg.Any<object>(),
            Arg.Any<Exception?>(),
            Arg.Any<Func<object, Exception?, string>>());

        logger.Received(1).Log(
            LogLevel.Error,
            Arg.Any<EventId>(),
            Arg.Any<object>(),
            exception,
            Arg.Any<Func<object, Exception?, string>>());
    }
}
