namespace GcDesignStudy.Api.Entities;

/// <summary>
/// Lookup table of valid support statuses a commenter can select (support,
/// support-with-comments, ...). CommentsEnabled mirrors isCommentEnabled() in
/// src/CommentShared.tsx — whether picking this status unlocks the comment fields. No
/// string key — display labels live in the frontend's i18n files, keyed by this same
/// numeric Id as a string (e.g. "comment.statuses.1").
/// </summary>
public class SupportStatus
{
    public int Id { get; set; }

    public bool CommentsEnabled { get; set; }

    public int SortOrder { get; set; }
}
