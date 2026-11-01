namespace GcDesignStudy.Api.Dtos;

/// <summary>A selectable role key for the frontend's role combobox, e.g. "manager". Display text stays in the frontend's i18n files.</summary>
public record RoleDto(string Id, int SortOrder);
