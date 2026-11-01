namespace GcDesignStudy.Api.Services;

/// <summary>
/// Resolves the logged-in user's id for the current request from the Entra ID "oid"
/// claim. Null when the claim isn't present — callers must check explicitly and return
/// Unauthorized() rather than relying on this to throw.
/// </summary>
public interface ICurrentUserService
{
    string? UserId { get; }
}
