using Azure.Identity;
using Herit.Application.Features.Rfp.Commands.CreateRfp;
using Herit.Infrastructure;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

var keyVaultEndpoint = builder.Configuration["AZURE_KEY_VAULT_ENDPOINT"];
if (!string.IsNullOrEmpty(keyVaultEndpoint))
    builder.Configuration.AddAzureKeyVault(new Uri(keyVaultEndpoint), new DefaultAzureCredential());

builder.Services.AddControllers();

builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(CreateRfpCommand).Assembly));

var connectionStringKey = builder.Configuration["AZURE_SQL_CONNECTION_STRING_KEY"];
var connectionString = (!string.IsNullOrEmpty(connectionStringKey)
    ? builder.Configuration[connectionStringKey]
    : null)
    ?? builder.Configuration.GetConnectionString("DefaultConnection")!;

builder.Services.AddInfrastructure(connectionString);

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

app.UseHttpsRedirection();
app.MapControllers();

app.Run();
