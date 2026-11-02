using GcDesignStudy.Api.Dtos;
using GcDesignStudy.Api.Mapping;
using GcDesignStudy.Api.Repositories;
using GcDesignStudy.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GcDesignStudy.Api.Controllers;

[ApiController]
[Route("api/comments")]
[Authorize]
public class CommentsController(ICommentRepository commentRepository, CommentMapper mapper, ICurrentUserService currentUser) : ControllerBase
{
    private const int DefaultPageSize = 20;
    private const int MaxPageSize = 100;

    /// <summary>
    /// POST /api/comments — called when the user confirms their comment on the review
    /// step. The frontend should navigate to the comments list page on success.
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

        var saved = await commentRepository.AddAsync(entity, ct);
        return CreatedAtAction(nameof(GetById), new { id = saved.Id }, mapper.ToDetailDto(saved));
    }

    private static readonly HashSet<string> SortableFields = ["id", "role", "position", "submitted"];

    /// <summary>
    /// GET /api/comments — a sorted, paged slice of the logged-in user's own comments.
    /// Backs the comments list page. sortBy defaults to "submitted" (newest first);
    /// anything outside SortableFields falls back to that same default.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResult<CommentListItemDto>>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = DefaultPageSize,
        [FromQuery] string sortBy = "submitted",
        [FromQuery] bool sortDescending = true,
        CancellationToken ct = default)
    {
        var userId = currentUser.UserId;
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, MaxPageSize);
        sortBy = SortableFields.Contains(sortBy.ToLowerInvariant()) ? sortBy.ToLowerInvariant() : "submitted";

        var (items, totalCount) = await commentRepository.GetByUserIdAsync(userId, page, pageSize, sortBy, sortDescending, ct);
        return Ok(new PagedResult<CommentListItemDto>(items.Select(mapper.ToListItemDto).ToList(), page, pageSize, totalCount));
    }

    /// <summary>GET /api/comments/{id} — full detail for one of the logged-in user's own comments.</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<CommentDetailDto>> GetById(int id, CancellationToken ct)
    {
        var userId = currentUser.UserId;
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var comment = await commentRepository.GetByIdAsync(id, userId, ct);
        return comment is null ? NotFound() : Ok(mapper.ToDetailDto(comment));
    }
}
