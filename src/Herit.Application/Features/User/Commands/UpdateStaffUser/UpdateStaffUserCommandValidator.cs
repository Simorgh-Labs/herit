using FluentValidation;

namespace Herit.Application.Features.User.Commands.UpdateStaffUser;

public class UpdateStaffUserCommandValidator : AbstractValidator<UpdateStaffUserCommand>
{
    public UpdateStaffUserCommandValidator()
    {
        RuleFor(x => x.Id).NotEqual(Guid.Empty);
        RuleFor(x => x.Email).NotEmpty().MaximumLength(256);
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(256);
    }
}
