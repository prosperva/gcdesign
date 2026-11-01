namespace GcDesignStudy.Api.Entities;

/// <summary>A published document open (or previously open) for comment. Mirrors DOCUMENTS in src/data.ts.</summary>
public class Document
{
    public string DocumentId { get; set; } = default!;

    public string TitleEn { get; set; } = default!;

    public string TitleFr { get; set; } = default!;

    public string Version { get; set; } = default!;

    public DateTime ClosingDate { get; set; }
}
