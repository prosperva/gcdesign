using GcDesignStudy.Api.Data;
using GcDesignStudy.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace GcDesignStudy.Api.Repositories;

public class SupportStatusRepository(AppDbContext db) : ISupportStatusRepository
{
    public async Task<List<SupportStatus>> GetAllAsync(CancellationToken ct) =>
        await db.SupportStatuses.OrderBy(s => s.SortOrder).ToListAsync(ct);
}
