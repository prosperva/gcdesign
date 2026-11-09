namespace GcDesignStudy.Api.Entities;

/// <summary>
/// Lookup table of valid roles a commenter can select (manager, director, ...).
/// </summary>
public class Role
{
    public int Id { get; set; }

    public string TitleEn { get; set; } = default!;

    public string TitleFr { get; set; } = default!;

    public int SortOrder { get; set; }
}
