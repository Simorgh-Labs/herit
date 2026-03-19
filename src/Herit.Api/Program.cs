using Herit.Application.Features.Rfp.Commands.CreateRfp;
using Herit.Infrastructure;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(CreateRfpCommand).Assembly));

builder.Services.AddInfrastructure(
    "Server=localhost;Database=Herit;Trusted_Connection=True;TrustServerCertificate=True;");

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Herit API", Version = "v1" }));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Herit API v1"));
}

app.UseHttpsRedirection();
app.MapControllers();

app.Run();
