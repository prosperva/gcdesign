namespace GcDesignStudy.Api.Entities;

/// <summary>
/// A predefined section a comment can be tied to (Purpose and Scope, Definitions, ...).
/// Global and fixed — every document offers the same set, so there's no per-document
/// relationship here, just this one lookup table.
/// </summary>
public class Section
{
    public string SectionKey { get; set; } = default!;

    public string TitleEn { get; set; } = default!;

    public string TitleFr { get; set; } = default!;

    public bool AllowSplit { get; set; }

    public int SortOrder { get; set; }
}
