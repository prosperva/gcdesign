using GcDesignStudy.Api.Dtos;
using GcDesignStudy.Api.Mapping;
using GcDesignStudy.Api.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace GcDesignStudy.Api.Controllers;

[ApiController]
[Route("api/support-statuses")]
public class SupportStatusesController(ISupportStatusRepository supportStatusRepository, CommentMapper mapper) : ControllerBase
{
    /// <summary>GET /api/support-statuses — valid position keys for the comment form's "Your position" picker.</summary>
    [HttpGet]
    public async Task<ActionResult<List<SupportStatusDto>>> Get(CancellationToken ct)
    {
        var statuses = await supportStatusRepository.GetAllAsync(ct);
        return Ok(statuses.Select(mapper.ToDto).ToList());
    }
}
