using Herit.Application.Interfaces;
using Herit.Infrastructure.Persistence;
using Herit.Infrastructure.Repositories;
using Herit.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Herit.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, string connectionString)
    {
        services.AddDbContext<HeritDbContext>(options =>
            options.UseSqlServer(connectionString));

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRfpRepository, RfpRepository>();
        services.AddScoped<IProposalRepository, ProposalRepository>();
        services.AddScoped<ICfeoiRepository, CfeoiRepository>();
        services.AddScoped<IEoiRepository, EoiRepository>();
        services.AddScoped<IOrganisationRepository, OrganisationRepository>();
        services.AddScoped<IIdentityProviderService, B2cIdentityProviderService>();

        return services;
    }
}
