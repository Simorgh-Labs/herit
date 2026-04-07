using FluentValidation;

namespace Herit.Application.Features.User.Commands.RegisterExpat;

public class RegisterExpatCommandValidator : AbstractValidator<RegisterExpatCommand>
{
    public RegisterExpatCommandValidator()
    {
        RuleFor(x => x.ExternalId).NotEmpty();
        RuleFor(x => x.Email).NotEmpty().MaximumLength(256);
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(256);
    }
}
