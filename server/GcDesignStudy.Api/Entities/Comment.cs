using System.ComponentModel.DataAnnotations.Schema;

namespace GcDesignStudy.Api.Entities;

/// <summary>
/// The main comment submission a user makes on a document: one row per
/// "Submit comments" confirmation. Per-section remarks live in <see cref="CommentSection"/>.
/// </summary>
public class Comment
{
    public int Id { get; set; }

    public string UserId { get; set; } = default!;

    public string DocumentId { get; set; } = default!;

    public Document Document { get; set; } = default!;

    public string Version { get; set; } = default!;

    public string RoleKey { get; set; } = default!;

    public Role Role { get; set; } = default!;

    public string SupportStatusKey { get; set; } = default!;

    public SupportStatus SupportStatus { get; set; } = default!;

    public string? GeneralComment { get; set; }

    public List<string> Attachments { get; set; } = new();

    public DateTime SubmittedAt { get; set; }

    public List<CommentSection> Sections { get; set; } = new();

    /// <summary>Not persisted — lets the mapper build CommentListItemDto in one pass instead of patching it in afterward.</summary>
    [NotMapped]
    public int SectionCommentCount => Sections.Count;
}
