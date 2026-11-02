using GcDesignStudy.Api.Data;
using GcDesignStudy.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace GcDesignStudy.Api.Repositories;

public class SectionRepository(AppDbContext db) : ISectionRepository
{
    public async Task<List<Section>> GetAllAsync(CancellationToken ct) =>
        await db.Sections.OrderBy(s => s.SortOrder).ToListAsync(ct);
}
