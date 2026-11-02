namespace GcDesignStudy.Api.Dtos;

/// <summary>A selectable support status for the comment form's position picker. Display
/// text lives in the frontend's i18n files, keyed by this Id as a string (e.g.
/// "comment.statuses.1").</summary>
public record SupportStatusDto(int Id, bool CommentsEnabled, int SortOrder);
