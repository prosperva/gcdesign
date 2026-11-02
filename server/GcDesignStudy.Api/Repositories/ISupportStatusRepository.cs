using GcDesignStudy.Api.Entities;

namespace GcDesignStudy.Api.Repositories;

public interface ISupportStatusRepository
{
    Task<List<SupportStatus>> GetAllAsync(CancellationToken ct);
}
