using GcDesignStudy.Api.Entities;

namespace GcDesignStudy.Api.Repositories;

public interface IRoleRepository
{
    Task<List<Role>> GetAllAsync(CancellationToken ct);
}
