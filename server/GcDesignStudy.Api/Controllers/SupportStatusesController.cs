using GcDesignStudy.Api.Data;
using GcDesignStudy.Api.Dtos;
using GcDesignStudy.Api.Mapping;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GcDesignStudy.Api.Controllers;

[ApiController]
[Route("api/support-statuses")]
public class SupportStatusesController(AppDbContext db, CommentMapper mapper) : ControllerBase
{
    /// <summary>GET /api/support-statuses — valid position keys for the comment form's "Your position" picker.</summary>
    [HttpGet]
    public async Task<ActionResult<List<SupportStatusDto>>> Get(CancellationToken ct)
    {
        var statuses = await db.SupportStatuses
            .OrderBy(s => s.SortOrder)
            .ToListAsync(ct);

        return Ok(statuses.Select(s => mapper.ToDto(s)).ToList());
    }
}
