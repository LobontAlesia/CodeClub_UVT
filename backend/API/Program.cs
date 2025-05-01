using API.Constants;
using API.Repositories;
using API.Repositories.Implementation;
using API.SetupExtensions;
using dotenv.net;

DotEnv.Load();

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddEnvironmentVariables();

EnvironmentVariables.SetEnvironmentVariables(builder.Configuration);

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