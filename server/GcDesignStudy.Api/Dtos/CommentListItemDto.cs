namespace GcDesignStudy.Api.Dtos;

/// <summary>One row on the "comments I've submitted" list page.</summary>
public record CommentListItemDto(
    int Id,
    int DocumentId,
    List<int> Roles,
    string? OtherRole,
    int SupportStatus,
    string? GeneralComment,
    DateTime SubmittedAt,
    int SectionCommentCount);
