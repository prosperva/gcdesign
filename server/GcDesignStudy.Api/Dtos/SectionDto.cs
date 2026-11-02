namespace GcDesignStudy.Api.Dtos;

/// <summary>A predefined section the frontend can offer in its section dropdown.</summary>
public record SectionDto(int Id, string TitleEn, string TitleFr, bool AllowSplit);
