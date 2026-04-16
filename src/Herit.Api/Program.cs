using Azure.Identity;
using FluentValidation;
using Herit.Api.Authorization;
using Herit.Api.Middleware;
using Herit.Api.Services;
using Herit.Application.Behaviours;
using Herit.Application.Features.Rfp.Commands.CreateRfp;
using Herit.Application.Interfaces;
using Herit.Application.Seeding;
using Herit.Domain.Enums;
using Herit.Infrastructure;
using Herit.Infrastructure.Persistence;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web;
using Microsoft.OpenApi.Models;

if (args.Contains("--seed-super-admin"))
    return await RunSeedSuperAdminAsync(args);

var builder = WebApplication.CreateBuilder(args);

var keyVaultEndpoint = builder.Configuration["AZURE_KEY_VAULT_ENDPOINT"];
if (!string.IsNullOrEmpty(keyVaultEndpoint) && !builder.Environment.IsDevelopment())
    builder.Configuration.AddAzureKeyVault(new Uri(keyVaultEndpoint), new DefaultAzureCredential());

builder.Services.AddMicrosoftIdentityWebApiAuthentication(builder.Configuration, "AzureAd");

var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()));

builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter()));

builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(CreateRfpCommand).Assembly));

builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(LoggingBehaviour<,>));
builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehaviour<,>));
builder.Services.AddValidatorsFromAssembly(typeof(CreateRfpCommand).Assembly);

var connectionStringKey = builder.Configuration["AZURE_SQL_CONNECTION_STRING_KEY"];
var connectionString = (!string.IsNullOrEmpty(connectionStringKey)
    ? builder.Configuration[connectionStringKey]
    : null)
    ?? builder.Configuration.GetConnectionString("DefaultConnection")!;

builder.Services.AddInfrastructure(connectionString);

builder.Services.AddAuthorizationBuilder()
    .AddPolicy("SuperAdmin", policy =>
        policy.AddRequirements(new RoleRequirement(UserRole.SuperAdmin)))
    .AddPolicy("OrganisationAdmin", policy =>
        policy.AddRequirements(new RoleRequirement(UserRole.OrganisationAdmin)))
    .AddPolicy("Staff", policy =>
        policy.AddRequirements(new RoleRequirement(UserRole.Staff)))
    .AddPolicy("Expat", policy =>
        policy.AddRequirements(new RoleRequirement(UserRole.Expat)))
    .AddPolicy("AdminOrSuperAdmin", policy =>
        policy.AddRequirements(new RoleRequirement(UserRole.OrganisationAdmin, UserRole.SuperAdmin)))
    .AddPolicy("StaffOrExpat", policy =>
        policy.AddRequirements(new RoleRequirement(UserRole.Staff, UserRole.Expat)));
builder.Services.AddScoped<IAuthorizationHandler, RoleRequirementHandler>();

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddHostedService<DatabaseMigrationService>();

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

builder.Services.AddEndpointsApiExplorer();

var enableSwagger = builder.Configuration.GetValue<bool>("Features:EnableSwagger");
if (enableSwagger)
{
    builder.Services.AddSwaggerGen(c =>
        c.SwaggerDoc("v1", new OpenApiInfo { Title = "Herit API", Version = "v1" }));
}

var app = builder.Build();

if (enableSwagger)
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Herit API v1"));
}

app.UseExceptionHandler();
app.UseHttpsRedirection();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
return 0;

static async Task<int> RunSeedSuperAdminAsync(string[] args)
{
    var email = GetArg(args, "--email");
    var displayName = GetArg(args, "--display-name");

    var missing = new List<string>();
    if (string.IsNullOrWhiteSpace(email)) missing.Add("--email");
    if (string.IsNullOrWhiteSpace(displayName)) missing.Add("--display-name");

    if (missing.Count > 0)
    {
        await Console.Error.WriteLineAsync($"Error: missing required argument(s): {string.Join(", ", missing)}");
        await Console.Error.WriteLineAsync("Usage: dotnet run --project Herit.API -- --seed-super-admin --email <email> --display-name <name>");
        return 1;
    }

    var seedBuilder = WebApplication.CreateBuilder(args);

    var kvEndpoint = seedBuilder.Configuration["AZURE_KEY_VAULT_ENDPOINT"];
    if (!string.IsNullOrEmpty(kvEndpoint) && !seedBuilder.Environment.IsDevelopment())
        seedBuilder.Configuration.AddAzureKeyVault(new Uri(kvEndpoint), new DefaultAzureCredential());

    var seedConnectionStringKey = seedBuilder.Configuration["AZURE_SQL_CONNECTION_STRING_KEY"];
    var seedConnectionString = (!string.IsNullOrEmpty(seedConnectionStringKey)
        ? seedBuilder.Configuration[seedConnectionStringKey]
        : null)
        ?? seedBuilder.Configuration.GetConnectionString("DefaultConnection")!;

    seedBuilder.Services.AddInfrastructure(seedConnectionString);
    seedBuilder.Services.AddScoped<SuperAdminSeeder>();

    var seedApp = seedBuilder.Build();

    await using var scope = seedApp.Services.CreateAsyncScope();
    var db = scope.ServiceProvider.GetRequiredService<HeritDbContext>();
    await db.Database.MigrateAsync();

    var seeder = scope.ServiceProvider.GetRequiredService<SuperAdminSeeder>();
    await seeder.SeedAsync(email!, displayName!);

    return 0;
}

static string? GetArg(string[] args, string name)
{
    var idx = Array.IndexOf(args, name);
    return idx >= 0 && idx + 1 < args.Length ? args[idx + 1] : null;
}
