using GcDesignStudy.Api.Entities;

namespace GcDesignStudy.Api.Repositories;

public interface IDocumentRepository
{
    Task<List<Document>> GetAllAsync(CancellationToken ct);
}
