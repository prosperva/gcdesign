namespace GcDesignStudy.Api.Dtos;

/// <summary>One row on the "comments I've submitted" list page.</summary>
public record CommentListItemDto(
    int Id,
    string DocumentId,
    string Role,
    string SupportStatus,
    string? GeneralComment,
    DateTime SubmittedAt,
    int SectionCommentCount);
