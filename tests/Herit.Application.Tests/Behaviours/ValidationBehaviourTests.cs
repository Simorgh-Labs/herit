using FluentValidation;
using Herit.Application.Behaviours;
using MediatR;
using NSubstitute;

namespace Herit.Application.Tests.Behaviours;

public class ValidationBehaviourTests
{
    public record TestRequest(string Value) : IRequest<string>;

    private class AlwaysValidValidator : AbstractValidator<TestRequest>
    {
        public AlwaysValidValidator()
        {
            RuleFor(x => x.Value).NotEmpty();
        }
    }

    private class AlwaysInvalidValidator : AbstractValidator<TestRequest>
    {
        public AlwaysInvalidValidator()
        {
            RuleFor(x => x.Value).Must(_ => false).WithMessage("Always fails.");
        }
    }

    [Fact]
    public async Task Handle_NoValidators_CallsNext()
    {
        var behaviour = new ValidationBehaviour<TestRequest, string>([]);
        var next = Substitute.For<RequestHandlerDelegate<string>>();
        next(Arg.Any<CancellationToken>()).Returns("result");

        var result = await behaviour.Handle(new TestRequest("value"), next, CancellationToken.None);

        Assert.Equal("result", result);
        await next.Received(1)(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_ValidationPasses_CallsNext()
    {
        var behaviour = new ValidationBehaviour<TestRequest, string>([new AlwaysValidValidator()]);
        var next = Substitute.For<RequestHandlerDelegate<string>>();
        next(Arg.Any<CancellationToken>()).Returns("result");

        var result = await behaviour.Handle(new TestRequest("value"), next, CancellationToken.None);

        Assert.Equal("result", result);
        await next.Received(1)(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_ValidationFails_ThrowsValidationException()
    {
        var behaviour = new ValidationBehaviour<TestRequest, string>([new AlwaysInvalidValidator()]);
        var next = Substitute.For<RequestHandlerDelegate<string>>();

        await Assert.ThrowsAsync<ValidationException>(() =>
            behaviour.Handle(new TestRequest("value"), next, CancellationToken.None));

        await next.DidNotReceive()(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_MultipleValidators_AggregatesFailures()
    {
        var behaviour = new ValidationBehaviour<TestRequest, string>(
            [new AlwaysInvalidValidator(), new AlwaysInvalidValidator()]);
        var next = Substitute.For<RequestHandlerDelegate<string>>();

        var ex = await Assert.ThrowsAsync<ValidationException>(() =>
            behaviour.Handle(new TestRequest("value"), next, CancellationToken.None));

        Assert.True(ex.Errors.Count() >= 2);
        await next.DidNotReceive()(Arg.Any<CancellationToken>());
    }
}
