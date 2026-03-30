using System.Net;
using System.Text.Json;
using FluentValidation;
using FluentValidation.Results;
using Herit.Api.Middleware;
using Herit.Application.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;

namespace Herit.Api.Tests.Middleware;

public class GlobalExceptionHandlerTests
{
    private readonly GlobalExceptionHandler _handler = new(NullLogger<GlobalExceptionHandler>.Instance);

    private static HttpContext CreateHttpContext()
    {
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        return context;
    }

    [Fact]
    public async Task TryHandleAsync_NotFoundException_Returns404()
    {
        var context = CreateHttpContext();
        var exception = new NotFoundException("Resource not found");

        var handled = await _handler.TryHandleAsync(context, exception, CancellationToken.None);

        Assert.True(handled);
        Assert.Equal((int)HttpStatusCode.NotFound, context.Response.StatusCode);
    }

    [Fact]
    public async Task TryHandleAsync_InvalidOperationException_Returns400()
    {
        var context = CreateHttpContext();
        var exception = new InvalidOperationException("Bad request");

        var handled = await _handler.TryHandleAsync(context, exception, CancellationToken.None);

        Assert.True(handled);
        Assert.Equal((int)HttpStatusCode.BadRequest, context.Response.StatusCode);
    }

    [Fact]
    public async Task TryHandleAsync_ValidationException_Returns422WithErrors()
    {
        var context = CreateHttpContext();
        var failures = new[]
        {
            new ValidationFailure("Name", "Name is required"),
            new ValidationFailure("Email", "Email is invalid")
        };
        var exception = new ValidationException(failures);

        var handled = await _handler.TryHandleAsync(context, exception, CancellationToken.None);

        Assert.True(handled);
        Assert.Equal((int)HttpStatusCode.UnprocessableEntity, context.Response.StatusCode);

        context.Response.Body.Seek(0, SeekOrigin.Begin);
        var body = await new StreamReader(context.Response.Body).ReadToEndAsync();
        Assert.Contains("errors", body);
        Assert.Contains("Name is required", body);
        Assert.Contains("Email is invalid", body);
    }

    [Fact]
    public async Task TryHandleAsync_UnhandledException_Returns500WithoutDetails()
    {
        var context = CreateHttpContext();
        var exception = new Exception("Sensitive internal error");

        var handled = await _handler.TryHandleAsync(context, exception, CancellationToken.None);

        Assert.True(handled);
        Assert.Equal((int)HttpStatusCode.InternalServerError, context.Response.StatusCode);

        context.Response.Body.Seek(0, SeekOrigin.Begin);
        var body = await new StreamReader(context.Response.Body).ReadToEndAsync();
        Assert.DoesNotContain("Sensitive internal error", body);
    }
}
