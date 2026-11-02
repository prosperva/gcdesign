using GcDesignStudy.Api.Dtos;
using GcDesignStudy.Api.Mapping;
using GcDesignStudy.Api.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace GcDesignStudy.Api.Controllers;

[ApiController]
[Route("api/sections")]
public class SectionsController(ISectionRepository sectionRepository, CommentMapper mapper) : ControllerBase
{
    /// <summary>GET /api/sections — the predefined sections available to comment on. Same list for every document.</summary>
    [HttpGet]
    public async Task<ActionResult<List<SectionDto>>> Get(CancellationToken ct)
    {
        var sections = await sectionRepository.GetAllAsync(ct);
        return Ok(sections.Select(mapper.ToDto).ToList());
    }
}
