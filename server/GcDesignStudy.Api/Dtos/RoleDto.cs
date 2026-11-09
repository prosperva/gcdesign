namespace GcDesignStudy.Api.Dtos;

/// <summary>A selectable role for the frontend's role combobox.</summary>
public record RoleDto(int Id, string TitleEn, string TitleFr, int SortOrder);
