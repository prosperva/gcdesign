namespace GcDesignStudy.Api.Dtos;

/// <summary>A document open (or previously open) for comment, for the document picker.</summary>
public record DocumentDto(int Id, string TitleEn, string TitleFr, string Version, DateTime ClosingDate, string DocumentLink);
