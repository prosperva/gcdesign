namespace GcDesignStudy.Api.Dtos;

/// <summary>One split-comment block. SectionId is null for a comment left unassigned to a section.</summary>
public record SubCommentDto(int? SectionId, string Comment);
