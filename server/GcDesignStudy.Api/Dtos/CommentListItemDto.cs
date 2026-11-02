namespace GcDesignStudy.Api.Dtos;

/// <summary>One row on the "comments I've submitted" list page.</summary>
public record CommentListItemDto(
    int Id,
    int DocumentId,
    int Role,
    int SupportStatus,
    string? GeneralComment,
    DateTime SubmittedAt,
    int SectionCommentCount);
