// Talks directly to the .NET API — there's no middleware/BFF in between anymore. That
// means two things this file has to own that used to live server-side in the middleware:
//
//   1. Identity: the .NET API's DevHeaderAuthenticationHandler resolves "who's calling"
//      from an X-User-Id header (falling back to its own default if it's absent). The
//      frontend has no real identity to assert yet, so this just sends the same dev
//      constant on every request. Once Entra ID lands, this stops sending X-User-Id and
//      the request interceptor instead attaches `Authorization: Bearer <token>` from
//      MSAL — the .NET side needs no change either way, since CurrentUserService already
//      reads whichever claim a real JWT bearer scheme ends up populating.
//   2. Document-title/link enrichment: GET /api/comments on the .NET side returns bare
//      documentId — joining in the title and link (so the comments list doesn't need a
//      second fetch per row) used to happen in the middleware's route handler; it happens
//      in getComments() below instead now.
import axios from 'axios';
import type {
  CommentDetailDto, CommentListItem, CreateCommentRequest,
  DocumentDto, PagedResult, RoleDto, SectionDto, SupportStatusDto,
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5080';
const DEV_USER_ID = 'usr-00042';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'X-User-Id': DEV_USER_ID },
});

client.interceptors.response.use(
  response => response,
  error => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 0;
      const data: unknown = error.response?.data;
      const message = typeof data === 'string' ? data : error.message;
      throw new ApiError(status, message);
    }
    throw error;
  },
);

// The .NET API's own list-item shape — no document title/link yet, those get joined in
// by getComments() below.
interface RawCommentListItemDto {
  id: number;
  documentId: number;
  role: number;
  supportStatus: number;
  generalComment: string | null;
  submittedAt: string;
  sectionCommentCount: number;
}

export const api = {
  getDocuments: async (): Promise<DocumentDto[]> =>
    (await client.get<DocumentDto[]>('/api/documents')).data,

  getSections: async (): Promise<SectionDto[]> =>
    (await client.get<SectionDto[]>('/api/sections')).data,

  getRoles: async (): Promise<RoleDto[]> =>
    (await client.get<RoleDto[]>('/api/roles')).data,

  getSupportStatuses: async (): Promise<SupportStatusDto[]> =>
    (await client.get<SupportStatusDto[]>('/api/support-statuses')).data,

  getComments: async (
    options: { page?: number; pageSize?: number; sortBy?: string; sortDescending?: boolean } = {},
  ): Promise<PagedResult<CommentListItem>> => {
    const { page = 1, pageSize = 10, sortBy = 'submitted', sortDescending = true } = options;

    const [paged, documents] = await Promise.all([
      client.get<PagedResult<RawCommentListItemDto>>('/api/comments', { params: { page, pageSize, sortBy, sortDescending } }),
      client.get<DocumentDto[]>('/api/documents'),
    ]);

    const documentsById = new Map(documents.data.map(d => [d.id, d]));
    const items: CommentListItem[] = paged.data.items.map(c => {
      const doc = documentsById.get(c.documentId);
      return {
        ...c,
        documentTitleEn: doc?.titleEn ?? null,
        documentTitleFr: doc?.titleFr ?? null,
        documentLink: doc?.documentLink ?? null,
      };
    });

    return { ...paged.data, items };
  },

  getComment: async (id: string): Promise<CommentDetailDto> =>
    (await client.get<CommentDetailDto>(`/api/comments/${id}`)).data,

  createComment: async (body: CreateCommentRequest): Promise<CommentDetailDto> =>
    (await client.post<CommentDetailDto>('/api/comments', body)).data,
};
