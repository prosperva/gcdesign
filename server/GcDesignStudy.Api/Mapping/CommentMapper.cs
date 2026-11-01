using GcDesignStudy.Api.Dtos;
using GcDesignStudy.Api.Entities;
using Riok.Mapperly.Abstractions;

namespace GcDesignStudy.Api.Mapping;

/// <summary>
/// Mapperly-generated mappings between entities and DTOs. Most members here match
/// by name and are mapped automatically by the source generator; the few that don't
/// (ids EF owns, the CommentText/Comment and RoleKey/Role renames, the computed
/// section count) are called out explicitly below.
/// </summary>
[Mapper]
public partial class CommentMapper
{
    // ── Create: request -> entity ──────────────────────────────────────────

    [MapperIgnoreTarget(nameof(Comment.Id))]
    [MapperIgnoreTarget(nameof(Comment.Role))]
    [MapperIgnoreTarget(nameof(Comment.Document))]
    [MapperIgnoreTarget(nameof(Comment.SupportStatus))]
    [MapProperty(nameof(CreateCommentRequest.Role), nameof(Comment.RoleKey))]
    [MapProperty(nameof(CreateCommentRequest.SupportStatus), nameof(Comment.SupportStatusKey))]
    public partial Comment ToEntity(CreateCommentRequest request);

    [MapperIgnoreTarget(nameof(CommentSection.Id))]
    [MapperIgnoreTarget(nameof(CommentSection.CommentId))]
    [MapperIgnoreTarget(nameof(CommentSection.Comment))]
    [MapperIgnoreTarget(nameof(CommentSection.Section))]
    [MapProperty(nameof(SubCommentDto.Comment), nameof(CommentSection.CommentText))]
    private partial CommentSection ToEntity(SubCommentDto dto);

    // ── Read: entity -> DTO ────────────────────────────────────────────────

    // Comment.Role/SupportStatus (navs) -> CommentDetailDto.Role/SupportStatus map
    // automatically: names match, and Mapperly reuses the ToDto() methods below for
    // the nested objects.
    public partial CommentDetailDto ToDetailDto(Comment entity);

    [MapProperty(nameof(CommentSection.CommentText), nameof(SubCommentDto.Comment))]
    private partial SubCommentDto ToDto(CommentSection entity);

    [MapperIgnoreSource(nameof(Comment.Role))]
    [MapperIgnoreSource(nameof(Comment.SupportStatus))]
    [MapProperty(nameof(Comment.RoleKey), nameof(CommentListItemDto.Role))]
    [MapProperty(nameof(Comment.SupportStatusKey), nameof(CommentListItemDto.SupportStatus))]
    public partial CommentListItemDto ToListItemDto(Comment entity);

    [MapProperty(nameof(Section.SectionKey), nameof(SectionDto.Id))]
    public partial SectionDto ToDto(Section entity);

    [MapProperty(nameof(Document.DocumentId), nameof(DocumentDto.Id))]
    public partial DocumentDto ToDto(Document entity);

    [MapProperty(nameof(Role.RoleKey), nameof(RoleDto.Id))]
    public partial RoleDto ToDto(Role entity);

    [MapProperty(nameof(SupportStatus.StatusKey), nameof(SupportStatusDto.Id))]
    public partial SupportStatusDto ToDto(SupportStatus entity);
}
