namespace GcDesignStudy.Api.Entities;

/// <summary>
/// One "split comment" block belonging to a <see cref="Comment"/>. <see cref="SectionId"/>
/// is null when the user left it as a general remark instead of tying it to a document section.
/// </summary>
public class CommentSection
{
    public int Id { get; set; }

    public int CommentId { get; set; }

    public Comment Comment { get; set; } = default!;

    public int? SectionId { get; set; }

    public Section? Section { get; set; }

    public string CommentText { get; set; } = default!;
}
