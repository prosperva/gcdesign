using GcDesignStudy.Api.Entities;

namespace GcDesignStudy.Api.Repositories;

public interface ISectionRepository
{
    Task<List<Section>> GetAllAsync(CancellationToken ct);
}
