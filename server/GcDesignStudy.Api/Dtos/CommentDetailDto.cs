namespace GcDesignStudy.Api.Dtos;

/// <summary>Full detail for a single submitted comment, including its split-comment blocks.</summary>
public record CommentDetailDto(
    int Id,
    string UserId,
    int DocumentId,
    string Version,
    List<RoleDto> Roles,
    string? OtherRole,
    SupportStatusDto SupportStatus,
    string? GeneralComment,
    List<string> Attachments,
    DateTime SubmittedAt,
    List<SubCommentDto> Sections);
