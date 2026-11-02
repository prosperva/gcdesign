namespace GcDesignStudy.Api.Dtos;

/// <summary>A selectable role for the frontend's role combobox. Display text lives in the
/// frontend's i18n files, keyed by this Id as a string (e.g. "comment.roles.1").</summary>
public record RoleDto(int Id, int SortOrder);
