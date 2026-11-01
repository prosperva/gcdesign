using GcDesignStudy.Api.Data;
using GcDesignStudy.Api.Dtos;
using GcDesignStudy.Api.Mapping;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GcDesignStudy.Api.Controllers;

[ApiController]
[Route("api/sections")]
public class SectionsController(AppDbContext db, CommentMapper mapper) : ControllerBase
{
    /// <summary>GET /api/sections — the predefined sections available to comment on. Same list for every document.</summary>
    [HttpGet]
    public async Task<ActionResult<List<SectionDto>>> Get(CancellationToken ct)
    {
        var sections = await db.Sections
            .OrderBy(s => s.SortOrder)
            .ToListAsync(ct);

        return Ok(sections.Select(s => mapper.ToDto(s)).ToList());
    }
}
