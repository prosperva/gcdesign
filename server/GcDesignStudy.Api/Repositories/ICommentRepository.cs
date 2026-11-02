using GcDesignStudy.Api.Entities;

namespace GcDesignStudy.Api.Repositories;

public interface ICommentRepository
{
    /// <summary>Saves the comment (and its CommentSection rows via the navigation property), then loads
    /// the Role/SupportStatus navs so the caller can map a full detail DTO from the result.</summary>
    Task<Comment> AddAsync(Comment comment, CancellationToken ct);

    /// <summary>A sorted, paged slice of a user's own comments. sortBy is one of
    /// "id", "role", "position", "submitted" — anything else falls back to submitted desc.</summary>
    Task<(List<Comment> Items, int TotalCount)> GetByUserIdAsync(
        string userId, int page, int pageSize, string sortBy, bool sortDescending, CancellationToken ct);

    Task<Comment?> GetByIdAsync(int id, string userId, CancellationToken ct);
}
