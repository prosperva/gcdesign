using GcDesignStudy.Api.Data;
using GcDesignStudy.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace GcDesignStudy.Api.Repositories;

public class DocumentRepository(AppDbContext db) : IDocumentRepository
{
    public async Task<List<Document>> GetAllAsync(CancellationToken ct) =>
        await db.Documents.OrderBy(d => d.ClosingDate).ToListAsync(ct);
}
