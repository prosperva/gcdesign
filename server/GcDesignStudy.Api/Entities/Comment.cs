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

    public int DocumentId { get; set; }

    public Document Document { get; set; } = default!;

    public string Version { get; set; } = default!;

    /// <summary>A comment can be submitted under more than one role (e.g. Manager + Policy Officer).</summary>
    public List<Role> Roles { get; set; } = new();

    /// <summary>Free text when "Other" is selected alongside/instead of a listed role.</summary>
    public string? OtherRole { get; set; }

    public int SupportStatusId { get; set; }

    public SupportStatus SupportStatus { get; set; } = default!;

    public string? GeneralComment { get; set; }

    public List<string> Attachments { get; set; } = new();

    public DateTime SubmittedAt { get; set; }

    public List<CommentSection> Sections { get; set; } = new();

    /// <summary>Not persisted — lets the mapper build CommentListItemDto in one pass instead of patching it in afterward.</summary>
    [NotMapped]
    public int SectionCommentCount => Sections.Count;
}
