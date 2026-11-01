namespace GcDesignStudy.Api.Entities;

/// <summary>
/// Lookup table of valid role keys a commenter can select (manager, director, ...).
/// Display labels stay owned by the frontend's i18n files (comment.roles.&lt;RoleKey&gt;);
/// this table exists to give Comment.RoleKey referential integrity and a stable, ordered list.
/// </summary>
public class Role
{
    public string RoleKey { get; set; } = default!;

    public int SortOrder { get; set; }
}
