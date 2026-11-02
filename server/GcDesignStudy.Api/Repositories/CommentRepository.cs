using GcDesignStudy.Api.Data;
using GcDesignStudy.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace GcDesignStudy.Api.Repositories;

public class CommentRepository(AppDbContext db) : ICommentRepository
{
    public async Task<Comment> AddAsync(Comment comment, CancellationToken ct)
    {
        db.Comments.Add(comment);
        await db.SaveChangesAsync(ct);

        // Only the FK keys were set by the mapper — load the navs so the caller can map
        // a full CommentDetailDto from the result without a second round trip.
        await db.Entry(comment).Reference(c => c.Role).LoadAsync(ct);
        await db.Entry(comment).Reference(c => c.SupportStatus).LoadAsync(ct);

        return comment;
    }

    public async Task<(List<Comment> Items, int TotalCount)> GetByUserIdAsync(
        string userId, int page, int pageSize, string sortBy, bool sortDescending, CancellationToken ct)
    {
        var unordered = db.Comments.Where(c => c.UserId == userId);
        var totalCount = await unordered.CountAsync(ct);

        // Each branch is its own typed OrderBy/OrderByDescending call — EF Core can
        // translate these reliably, which isn't guaranteed for a single selector boxed
        // through Expression<Func<Comment, object>>.
        IOrderedQueryable<Comment> query = (sortBy, sortDescending) switch
        {
            ("id", true) => unordered.OrderByDescending(c => c.Id),
            ("id", false) => unordered.OrderBy(c => c.Id),
            ("role", true) => unordered.OrderByDescending(c => c.RoleKey),
            ("role", false) => unordered.OrderBy(c => c.RoleKey),
            ("position", true) => unordered.OrderByDescending(c => c.SupportStatusKey),
            ("position", false) => unordered.OrderBy(c => c.SupportStatusKey),
            ("submitted", true) => unordered.OrderByDescending(c => c.SubmittedAt),
            ("submitted", false) => unordered.OrderBy(c => c.SubmittedAt),
            // Document title isn't sortable here — it lives on Documents, joined in by
            // the middleware after the fact, not part of this query. Fall back to the
            // default newest-first order for anything unrecognized.
            _ => unordered.OrderByDescending(c => c.SubmittedAt),
        };

        // Id is unique, so this makes the overall order fully deterministic — without it,
        // rows tied on the primary key (e.g. two comments submitted the same instant)
        // have no guaranteed relative order between separate paginated queries, which can
        // skip or duplicate a row across a page boundary.
        query = sortBy == "id" ? query : query.ThenBy(c => c.Id);

        var items = await query
            .Include(c => c.Sections)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, totalCount);
    }

    public async Task<Comment?> GetByIdAsync(int id, string userId, CancellationToken ct) =>
        await db.Comments
            .Include(c => c.Sections)
            .Include(c => c.Role)
            .Include(c => c.SupportStatus)
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId, ct);
}
