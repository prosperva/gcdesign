// Mirrors the .NET DTOs in server/GcDesignStudy.Api/Dtos — kept in sync by hand since
// the two services aren't in the same language. If this drifts, the .NET DTOs are
// authoritative.
//
// Every lookup table (Document, Section, Role, SupportStatus) is identified by a plain
// numeric id — there's no string business key anywhere in this schema. Role/SupportStatus
// display text comes from the frontend's own i18n files, keyed by that same numeric id as
// a string (e.g. "comment.roles.1" — see src/i18n/en.json).

export interface DocumentDto {
  id: number;
  titleEn: string;
  titleFr: string;
  version: string;
  closingDate: string;
  documentLink: string;
}

export interface SectionDto {
  id: number;
  titleEn: string;
  titleFr: string;
  allowSplit: boolean;
}

export interface RoleDto {
  id: number;
  sortOrder: number;
}

export interface SupportStatusDto {
  id: number;
  commentsEnabled: boolean;
  sortOrder: number;
}

export interface SubCommentDto {
  sectionId: number | null;
  comment: string;
}

export interface CommentDetailDto {
  id: number;
  userId: string;
  documentId: number;
  version: string;
  role: RoleDto;
  supportStatus: SupportStatusDto;
  generalComment: string | null;
  attachments: string[];
  submittedAt: string;
  sections: SubCommentDto[];
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface CommentListItem {
  id: number;
  documentId: number;
  documentTitleEn: string | null;
  documentTitleFr: string | null;
  documentLink: string | null;
  role: number;
  supportStatus: number;
  generalComment: string | null;
  submittedAt: string;
  sectionCommentCount: number;
}

export interface CreateCommentRequest {
  role: number;
  supportStatus: number;
  documentId: number;
  version: string;
  submittedAt: string;
  attachments: string[];
  generalComment: string;
  sections: SubCommentDto[];
}
