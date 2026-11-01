namespace GcDesignStudy.Api.Services;

/// <summary>
/// Reads the user id from the Entra ID object-id claim ("oid" in a v2.0 token; some
/// callers — notably ASP.NET's JWT handler on certain configurations — surface it under
/// the long-form claim type instead, so both are checked). This is the stable, immutable
/// identifier Microsoft recommends keying on, as opposed to email/UPN which can change.
/// </summary>
public class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    private const string LongFormObjectIdClaim = "http://schemas.microsoft.com/identity/claims/objectidentifier";

    public string? UserId =>
        httpContextAccessor.HttpContext?.User.FindFirst("oid")?.Value
        ?? httpContextAccessor.HttpContext?.User.FindFirst(LongFormObjectIdClaim)?.Value;
}
