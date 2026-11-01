using GcDesignStudy.Api.Data;
using GcDesignStudy.Api.Dtos;
using GcDesignStudy.Api.Mapping;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GcDesignStudy.Api.Controllers;

[ApiController]
[Route("api/documents")]
public class DocumentsController(AppDbContext db, CommentMapper mapper) : ControllerBase
{
    /// <summary>
    /// GET /api/documents — documents available for the document picker. Returns every
    /// document, closing date included; whether a given one is still open is left to the
    /// caller to decide (the frontend already does this itself from ClosingDate).
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<DocumentDto>>> Get(CancellationToken ct)
    {
        var documents = await db.Documents
            .OrderBy(d => d.ClosingDate)
            .ToListAsync(ct);

        return Ok(documents.Select(d => mapper.ToDto(d)).ToList());
    }
}
