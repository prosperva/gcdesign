namespace GcDesignStudy.Api.Dtos;

/// <summary>
/// Body for POST /api/comments. No UserId here — the server always saves under the
/// authenticated caller's id (see CommentsController.Create), so there's nothing for the
/// client to send on that front.
/// </summary>
public record CreateCommentRequest(
    List<int> Roles,
    string? OtherRole,
    int SupportStatus,
    int DocumentId,
    string Version,
    DateTime SubmittedAt,
    List<string> Attachments,
    string? GeneralComment,
    List<SubCommentDto> Sections);
