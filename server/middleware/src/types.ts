// Mirrors the DTOs in server/GcDesignStudy.Api/Dtos — kept in sync by hand since the
// two services aren't in the same language. If this drifts, the .NET DTOs are authoritative.

export interface DocumentDto {
  id: string;
  titleEn: string;
  titleFr: string;
  version: string;
  closingDate: string;
  documentLink: string;
}

export interface SectionDto {
  id: string;
  titleEn: string;
  titleFr: string;
  allowSplit: boolean;
}

export interface RoleDto {
  id: string;
  sortOrder: number;
}

export interface SupportStatusDto {
  id: string;
  commentsEnabled: boolean;
  sortOrder: number;
}

export interface SubCommentDto {
  sectionId: string | null;
  comment: string;
}

export interface CommentDetailDto {
  id: number;
  userId: string;
  documentId: string;
  version: string;
  role: RoleDto;
  supportStatus: SupportStatusDto;
  generalComment: string | null;
  attachments: string[];
  submittedAt: string;
  sections: SubCommentDto[];
}

export interface CommentListItemDto {
  id: number;
  documentId: string;
  role: string;
  supportStatus: string;
  generalComment: string | null;
  submittedAt: string;
  sectionCommentCount: number;
}

export interface CreateCommentRequest {
  userId: string;
  role: string;
  supportStatus: string;
  documentId: string;
  version: string;
  submittedAt: string;
  attachments: string[];
  generalComment: string | null;
  sections: SubCommentDto[];
}

/** What GET /api/comments actually returns from the middleware — the .NET list item plus the document title, joined server-side so the frontend doesn't need a second round trip. */
export interface CommentListItemWithDocument extends CommentListItemDto {
  documentTitleEn: string | null;
  documentTitleFr: string | null;
  documentLink: string | null;
}
