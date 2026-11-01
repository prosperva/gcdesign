using GcDesignStudy.Api.Data;
using GcDesignStudy.Api.Mapping;
using GcDesignStudy.Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.OperationFilter<UserIdHeaderOperationFilter>();
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<CommentMapper>();

// DEV/TEST ONLY: authenticates every request via the X-User-Id header (see
// DevHeaderAuthenticationHandler). Swap this for real auth (JWT, cookie, whatever the
// identity provider ends up being) once that's decided — CurrentUserService reads
// ClaimTypes.NameIdentifier, so it'll keep working with whatever scheme replaces this.
builder.Services.AddAuthentication(DevHeaderAuthenticationHandler.SchemeName)
    .AddScheme<Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions, DevHeaderAuthenticationHandler>(
        DevHeaderAuthenticationHandler.SchemeName, options => { });
builder.Services.AddAuthorization();

const string FrontendCorsPolicy = "Frontend";
builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
        policy.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors(FrontendCorsPolicy);
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
