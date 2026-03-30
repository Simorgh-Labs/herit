using Azure.Identity;
using FluentValidation;
using Herit.Api.Middleware;
using Herit.Application.Behaviours;
using Herit.Application.Features.Rfp.Commands.CreateRfp;
using Herit.Infrastructure;
using Herit.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

var keyVaultEndpoint = builder.Configuration["AZURE_KEY_VAULT_ENDPOINT"];
if (!string.IsNullOrEmpty(keyVaultEndpoint) && !builder.Environment.IsDevelopment())
    builder.Configuration.AddAzureKeyVault(new Uri(keyVaultEndpoint), new DefaultAzureCredential());

builder.Services.AddControllers();

builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(CreateRfpCommand).Assembly));

builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehaviour<,>));
builder.Services.AddValidatorsFromAssembly(typeof(CreateRfpCommand).Assembly);

var connectionStringKey = builder.Configuration["AZURE_SQL_CONNECTION_STRING_KEY"];
var connectionString = (!string.IsNullOrEmpty(connectionStringKey)
    ? builder.Configuration[connectionStringKey]
    : null)
    ?? builder.Configuration.GetConnectionString("DefaultConnection")!;

builder.Services.AddInfrastructure(connectionString);

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

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<HeritDbContext>();
    await db.Database.MigrateAsync();
}

if (enableSwagger)
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Herit API v1"));
}

app.UseExceptionHandler();
app.UseHttpsRedirection();
app.MapControllers();

app.Run();
