using FluentValidation;

namespace Herit.Application.Features.User.Commands.CreateOrganisationAdmin;

public class CreateOrganisationAdminCommandValidator : AbstractValidator<CreateOrganisationAdminCommand>
{
    public CreateOrganisationAdminCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().MaximumLength(256);
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(256);
        RuleFor(x => x.OrganisationId).NotEqual(Guid.Empty);
    }
}
