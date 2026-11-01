namespace GcDesignStudy.Api.Entities;

/// <summary>
/// Lookup table of valid support-status keys a commenter can select (support,
/// support-with-comments, ...). CommentsEnabled mirrors isCommentEnabled() in
/// src/CommentShared.tsx — whether picking this status unlocks the comment fields.
/// Display labels stay owned by the frontend's i18n files (comment.statuses.&lt;StatusKey&gt;).
/// </summary>
public class SupportStatus
{
    public string StatusKey { get; set; } = default!;

    public bool CommentsEnabled { get; set; }

    public int SortOrder { get; set; }
}
