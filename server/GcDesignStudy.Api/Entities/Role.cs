namespace GcDesignStudy.Api.Entities;

/// <summary>
/// Lookup table of valid roles a commenter can select (manager, director, ...). No
/// string key anywhere — display labels live in the frontend's i18n files, keyed by
/// this same numeric Id as a string (e.g. "comment.roles.1"). This table exists to give
/// Comment.RoleId referential integrity and a stable, ordered list.
/// </summary>
public class Role
{
    public int Id { get; set; }

    public int SortOrder { get; set; }
}
