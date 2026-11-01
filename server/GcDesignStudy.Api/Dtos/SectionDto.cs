namespace GcDesignStudy.Api.Dtos;

/// <summary>A predefined section the frontend can offer in its section dropdown. Id is the key, e.g. "purpose".</summary>
public record SectionDto(string Id, string TitleEn, string TitleFr, bool AllowSplit);
