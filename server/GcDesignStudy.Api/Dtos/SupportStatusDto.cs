namespace GcDesignStudy.Api.Dtos;

/// <summary>A selectable support-status key for the comment form's position picker. Display text stays in the frontend's i18n files.</summary>
public record SupportStatusDto(string Id, bool CommentsEnabled, int SortOrder);
