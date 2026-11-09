namespace GcDesignStudy.Api.Entities;

/// <summary>Join row: a comment can be submitted under more than one role.</summary>
public class CommentRole
{
    public int CommentId { get; set; }

    public Comment Comment { get; set; } = default!;

    public int RoleId { get; set; }

    public Role Role { get; set; } = default!;
}
