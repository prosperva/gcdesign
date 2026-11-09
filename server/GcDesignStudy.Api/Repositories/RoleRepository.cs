using GcDesignStudy.Api.Data;
using GcDesignStudy.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace GcDesignStudy.Api.Repositories;

public class RoleRepository(AppDbContext db) : IRoleRepository
{
    public async Task<List<Role>> GetAllAsync(CancellationToken ct) =>
        await db.Roles.OrderBy(r => r.SortOrder).ToListAsync(ct);

    public async Task<List<Role>> GetByIdsAsync(IEnumerable<int> ids, CancellationToken ct) =>
        await db.Roles.Where(r => ids.Contains(r.Id)).ToListAsync(ct);
}
