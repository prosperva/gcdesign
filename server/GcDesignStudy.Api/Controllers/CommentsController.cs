using GcDesignStudy.Api.Data;
using GcDesignStudy.Api.Dtos;
using GcDesignStudy.Api.Mapping;
using GcDesignStudy.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GcDesignStudy.Api.Controllers;

[ApiController]
[Route("api/comments")]
[Authorize]
public class CommentsController(AppDbContext db, CommentMapper mapper, ICurrentUserService currentUser) : ControllerBase
{
    /// <summary>
    /// POST /api/comments — called when the user confirms their comment on the review
    /// step. Saves the main Comment row plus its CommentSection rows in one transaction
    /// (SaveChanges inserts both together via the navigation property). The frontend
    /// should navigate to the comments list page on success.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<CommentDetailDto>> Create([FromBody] CreateCommentRequest request, CancellationToken ct)
    {
        var userId = currentUser.UserId;
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var entity = mapper.ToEntity(request);
        // Always save under the authenticated caller's id — never trust request.UserId.
        entity.UserId = userId;

        db.Comments.Add(entity);
        await db.SaveChangesAsync(ct);

        // Only the FK keys were set above — load the navs so ToDetailDto can map them.
        await db.Entry(entity).Reference(c => c.Role).LoadAsync(ct);
        await db.Entry(entity).Reference(c => c.SupportStatus).LoadAsync(ct);

        var dto = mapper.ToDetailDto(entity);
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, dto);
    }

    /// <summary>GET /api/comments — lists the logged-in user's own comments, newest first. Backs the comments list page.</summary>
    [HttpGet]
    public async Task<ActionResult<List<CommentListItemDto>>> List(CancellationToken ct)
    {
        var userId = currentUser.UserId;
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var comments = await db.Comments
            .Include(c => c.Sections)
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.SubmittedAt)
            .ToListAsync(ct);

        return Ok(comments.Select(c => mapper.ToListItemDto(c)).ToList());
    }

    /// <summary>GET /api/comments/{id} — full detail for one of the logged-in user's own comments.</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<CommentDetailDto>> GetById(int id, CancellationToken ct)
    {
        var userId = currentUser.UserId;
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var comment = await db.Comments
            .Include(c => c.Sections)
            .Include(c => c.Role)
            .Include(c => c.SupportStatus)
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId, ct);

        if (comment is null)
        {
            return NotFound();
        }

        return Ok(mapper.ToDetailDto(comment));
    }
}
