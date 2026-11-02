using GcDesignStudy.Api.Dtos;
using GcDesignStudy.Api.Mapping;
using GcDesignStudy.Api.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace GcDesignStudy.Api.Controllers;

[ApiController]
[Route("api/documents")]
public class DocumentsController(IDocumentRepository documentRepository, CommentMapper mapper) : ControllerBase
{
    /// <summary>
    /// GET /api/documents — documents available for the document picker. Returns every
    /// document, closing date included; whether a given one is still open is left to the
    /// caller to decide (the frontend already does this itself from ClosingDate).
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<DocumentDto>>> Get(CancellationToken ct)
    {
        var documents = await documentRepository.GetAllAsync(ct);
        return Ok(documents.Select(mapper.ToDto).ToList());
    }
}
