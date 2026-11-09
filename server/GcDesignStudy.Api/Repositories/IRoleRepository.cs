using GcDesignStudy.Api.Entities;

namespace GcDesignStudy.Api.Repositories;

public interface IRoleRepository
{
    Task<List<Role>> GetAllAsync(CancellationToken ct);

    /// <summary>Resolves submitted role ids to tracked entities for assigning to Comment.Roles.</summary>
    Task<List<Role>> GetByIdsAsync(IEnumerable<int> ids, CancellationToken ct);
}
