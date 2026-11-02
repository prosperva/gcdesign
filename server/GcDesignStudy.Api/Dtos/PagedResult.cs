namespace GcDesignStudy.Api.Dtos;

/// <summary>A page of items plus enough metadata for the caller to page further.</summary>
public record PagedResult<T>(List<T> Items, int Page, int PageSize, int TotalCount)
{
    public int TotalPages => PageSize <= 0 ? 0 : (int)Math.Ceiling(TotalCount / (double)PageSize);
}
