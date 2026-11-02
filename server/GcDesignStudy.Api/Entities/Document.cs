namespace GcDesignStudy.Api.Entities;

/// <summary>A published document open (or previously open) for comment. Mirrors DOCUMENTS in src/data.ts.</summary>
public class Document
{
    public int Id { get; set; }

    public string TitleEn { get; set; } = default!;

    public string TitleFr { get; set; } = default!;

    public string Version { get; set; } = default!;

    public DateTime ClosingDate { get; set; }

    public string DocumentLink { get; set; } = default!;
}
