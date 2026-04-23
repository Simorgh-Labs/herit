using FluentValidation;

namespace Herit.Application.Features.User.Commands.UpdateUserProfile;

public class UpdateUserProfileCommandValidator : AbstractValidator<UpdateUserProfileCommand>
{
    public UpdateUserProfileCommandValidator()
    {
        RuleFor(x => x.Id).NotEqual(Guid.Empty);
        RuleFor(x => x.Email).MaximumLength(256).When(x => x.Email is not null);
        RuleFor(x => x.Nationality).MaximumLength(128).When(x => x.Nationality is not null);
        RuleFor(x => x.Location).MaximumLength(256).When(x => x.Location is not null);
        RuleFor(x => x.ExpertiseTags).MaximumLength(1024).When(x => x.ExpertiseTags is not null);
    }
}
