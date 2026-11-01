// Mirrors server/middleware/src/types.ts, which mirrors the .NET DTOs. Kept in sync by
// hand across all three — if this drifts, the .NET DTOs are authoritative.

export interface DocumentDto {
  id: string;
  titleEn: string;
  titleFr: string;
  version: string;
  closingDate: string;
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

export interface CommentListItem {
  id: number;
  documentId: string;
  documentTitleEn: string | null;
  documentTitleFr: string | null;
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
  generalComment: string;
  sections: SubCommentDto[];
}
