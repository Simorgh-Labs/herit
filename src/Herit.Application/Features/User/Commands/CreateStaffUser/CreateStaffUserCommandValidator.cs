using FluentValidation;

namespace Herit.Application.Features.User.Commands.CreateStaffUser;

public class CreateStaffUserCommandValidator : AbstractValidator<CreateStaffUserCommand>
{
    public CreateStaffUserCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().MaximumLength(256);
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(256);
        RuleFor(x => x.OrganisationId).NotEqual(Guid.Empty);
    }
}
