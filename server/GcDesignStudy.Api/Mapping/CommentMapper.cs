using GcDesignStudy.Api.Dtos;
using GcDesignStudy.Api.Entities;
using Riok.Mapperly.Abstractions;
using System.Linq;

namespace GcDesignStudy.Api.Mapping;

/// <summary>
/// Mapperly-generated mappings between entities and DTOs. Most members here match
/// by name and are mapped automatically by the source generator; the few that don't
/// (ids EF owns, the CommentText/Comment rename, the Role/SupportStatus flattening on
/// the list item, the computed section count) are called out explicitly below.
/// </summary>
[Mapper]
public partial class CommentMapper
{
    // ── Create: request -> entity ──────────────────────────────────────────

    // Roles (int ids -> tracked Role entities) needs a DB lookup, so it's resolved and
    // assigned in the controller after this mapping, not here.
    [MapperIgnoreTarget(nameof(Comment.Id))]
    [MapperIgnoreTarget(nameof(Comment.Roles))]
    [MapperIgnoreTarget(nameof(Comment.Document))]
    [MapperIgnoreTarget(nameof(Comment.SupportStatus))]
    [MapProperty(nameof(CreateCommentRequest.SupportStatus), nameof(Comment.SupportStatusId))]
    public partial Comment ToEntity(CreateCommentRequest request);

    [MapperIgnoreTarget(nameof(CommentSection.Id))]
    [MapperIgnoreTarget(nameof(CommentSection.CommentId))]
    [MapperIgnoreTarget(nameof(CommentSection.Comment))]
    [MapperIgnoreTarget(nameof(CommentSection.Section))]
    [MapProperty(nameof(SubCommentDto.Comment), nameof(CommentSection.CommentText))]
    private partial CommentSection ToEntity(SubCommentDto dto);

    // ── Read: entity -> DTO ────────────────────────────────────────────────

    // Comment.Roles/SupportStatus (navs) -> CommentDetailDto.Roles/SupportStatus map
    // automatically: names match, and Mapperly reuses the ToDto() methods below for
    // the nested objects.
    public partial CommentDetailDto ToDetailDto(Comment entity);

    [MapProperty(nameof(CommentSection.CommentText), nameof(SubCommentDto.Comment))]
    private partial SubCommentDto ToDto(CommentSection entity);

    [MapperIgnoreSource(nameof(Comment.SupportStatus))]
    [MapProperty(nameof(Comment.SupportStatusId), nameof(CommentListItemDto.SupportStatus))]
    public partial CommentListItemDto ToListItemDto(Comment entity);

    private static List<int> MapRoleIds(List<Role> roles) => roles.Select(r => r.Id).ToList();

    public partial SectionDto ToDto(Section entity);

    public partial DocumentDto ToDto(Document entity);

    public partial RoleDto ToDto(Role entity);

    public partial SupportStatusDto ToDto(SupportStatus entity);
}
