using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace GcDesignStudy.Api.Services;

/// <summary>
/// DEV/TEST ONLY. Authenticates every request as whatever user id is in the X-User-Id
/// header (falling back to a fixed test user if the header is absent), so the API can be
/// exercised end-to-end — from Swagger, curl, or the frontend — before real auth (JWT,
/// cookie, whatever the identity provider ends up being) is wired up. Replace this scheme
/// before this goes anywhere near production; nothing here verifies the caller is who they
/// claim to be.
/// </summary>
public class DevHeaderAuthenticationHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    public const string SchemeName = "DevHeader";
    public const string UserIdHeader = "X-User-Id";
    public const string DefaultTestUserId = "usr-00042";

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var userId = Request.Headers.TryGetValue(UserIdHeader, out var values) && !string.IsNullOrWhiteSpace(values)
            ? values.ToString()
            : DefaultTestUserId;

        // "oid" to match the real Entra ID claim CurrentUserService reads once JWT bearer
        // auth replaces this handler — so nothing downstream needs to change shape.
        var identity = new ClaimsIdentity([new Claim("oid", userId)], SchemeName);
        var ticket = new AuthenticationTicket(new ClaimsPrincipal(identity), SchemeName);

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
