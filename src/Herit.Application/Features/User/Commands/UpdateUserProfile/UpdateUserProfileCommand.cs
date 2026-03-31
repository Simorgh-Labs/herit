using Herit.Application.Exceptions;
using Herit.Application.Interfaces;
using MediatR;

namespace Herit.Application.Features.User.Commands.UpdateUserProfile;

public record UpdateUserProfileCommand(
    Guid Id,
    string? Nationality = null,
    string? Location = null,
    string? ExpertiseTags = null,
    DateTimeOffset? TermsAcceptedAt = null) : IRequest<Unit>;

public class UpdateUserProfileCommandHandler : IRequestHandler<UpdateUserProfileCommand, Unit>
{
    private readonly IUserRepository _userRepository;

    public UpdateUserProfileCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<Unit> Handle(UpdateUserProfileCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.Id, cancellationToken);
        if (user is null)
            throw new NotFoundException($"User with ID '{request.Id}' was not found.");

        user.UpdateProfile(
            request.Nationality,
            request.Location,
            request.ExpertiseTags,
            request.TermsAcceptedAt);

        await _userRepository.UpdateAsync(user, cancellationToken);

        return Unit.Value;
    }
}
