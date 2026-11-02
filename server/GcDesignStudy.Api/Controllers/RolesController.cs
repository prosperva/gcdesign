using GcDesignStudy.Api.Dtos;
using GcDesignStudy.Api.Mapping;
using GcDesignStudy.Api.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace GcDesignStudy.Api.Controllers;

[ApiController]
[Route("api/roles")]
public class RolesController(IRoleRepository roleRepository, CommentMapper mapper) : ControllerBase
{
    /// <summary>GET /api/roles — valid role keys for the comment form's role picker.</summary>
    [HttpGet]
    public async Task<ActionResult<List<RoleDto>>> Get(CancellationToken ct)
    {
        var roles = await roleRepository.GetAllAsync(ct);
        return Ok(roles.Select(mapper.ToDto).ToList());
    }
}
