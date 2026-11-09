namespace GcDesignStudy.Api.Dtos;

/// <summary>A selectable support status for the comment form's position picker.</summary>
public record SupportStatusDto(int Id, string TitleEn, string TitleFr, bool CommentsEnabled, int SortOrder);
