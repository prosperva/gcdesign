using GcDesignStudy.Api.Data;
using GcDesignStudy.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace GcDesignStudy.Api.Repositories;

public class RoleRepository(AppDbContext db) : IRoleRepository
{
    public async Task<List<Role>> GetAllAsync(CancellationToken ct) =>
        await db.Roles.OrderBy(r => r.SortOrder).ToListAsync(ct);
}
