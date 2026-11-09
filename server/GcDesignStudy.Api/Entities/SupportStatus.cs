namespace GcDesignStudy.Api.Entities;

/// <summary>
/// Lookup table of valid support statuses a commenter can select (support,
/// support-with-comments, ...). CommentsEnabled mirrors isCommentEnabled() in
/// src/CommentShared.tsx — whether picking this status unlocks the comment fields.
/// </summary>
public class SupportStatus
{
    public int Id { get; set; }

    public string TitleEn { get; set; } = default!;

    public string TitleFr { get; set; } = default!;

    public bool CommentsEnabled { get; set; }

    public int SortOrder { get; set; }
}
