using API.Constants;
using API.Repositories;
using API.Repositories.Implementation;
using API.SetupExtensions;
using dotenv.net;
using Microsoft.AspNetCore.Server.Kestrel.Core;

DotEnv.Load();

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddEnvironmentVariables();

EnvironmentVariables.SetEnvironmentVariables(builder.Configuration);

// Configure Kestrel
builder.WebHost.ConfigureKestrel(options => {
    options.Limits.MaxRequestBodySize = 52428800; // 50MB
    options.Limits.MaxRequestHeadersTotalSize = 32768; // 32KB
    options.Limits.RequestHeadersTimeout = TimeSpan.FromSeconds(60);
});

builder.Services.Configure<KestrelServerOptions>(options =>
{
    options.Limits.MaxRequestBodySize = 52428800; // 50MB
    options.Limits.MaxRequestHeadersTotalSize = 32768; // 32KB
});

builder.Services.Configure<IISServerOptions>(options =>
{
    options.MaxRequestBodySize = 52428800; // 50MB
});

builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGenExtension();
builder.Services.AddCorsExtension();
builder.Services.AddAuthenticationExtension();

builder.Services.AddRepositories();
builder.Services.AddServices();
builder.Services.AddDbContextExtension();
builder.Services.AddRequestContextExtension();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();

app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();