using GcDesignStudy.Api.Data;
using GcDesignStudy.Api.Dtos;
using GcDesignStudy.Api.Mapping;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GcDesignStudy.Api.Controllers;

[ApiController]
[Route("api/roles")]
public class RolesController(AppDbContext db, CommentMapper mapper) : ControllerBase
{
    /// <summary>GET /api/roles — valid role keys for the comment form's role picker.</summary>
    [HttpGet]
    public async Task<ActionResult<List<RoleDto>>> Get(CancellationToken ct)
    {
        var roles = await db.Roles
            .OrderBy(r => r.SortOrder)
            .ToListAsync(ct);

        return Ok(roles.Select(r => mapper.ToDto(r)).ToList());
    }
}
