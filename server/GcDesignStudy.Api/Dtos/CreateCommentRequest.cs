namespace GcDesignStudy.Api.Dtos;

/// <summary>
/// Body for POST /api/comments. Matches the requestBody shape CommentPage.tsx already
/// builds on submit. UserId is accepted for shape-compatibility but the server always
/// saves under the authenticated caller's id, never whatever is in the body.
/// </summary>
public record CreateCommentRequest(
    string UserId,
    string Role,
    string SupportStatus,
    string DocumentId,
    string Version,
    DateTime SubmittedAt,
    List<string> Attachments,
    string? GeneralComment,
    List<SubCommentDto> Sections);
