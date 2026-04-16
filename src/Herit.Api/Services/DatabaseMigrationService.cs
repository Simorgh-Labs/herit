using Herit.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Herit.Api.Services;

public class DatabaseMigrationService(IServiceProvider serviceProvider, ILogger<DatabaseMigrationService> logger)
    : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("Running database migrations...");
        using var scope = serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<HeritDbContext>();
        await db.Database.MigrateAsync(stoppingToken);
        logger.LogInformation("Database migrations complete.");
    }
}
