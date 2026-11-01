import type {
  CommentDetailDto, CommentListItem, CreateCommentRequest,
  DocumentDto, RoleDto, SectionDto, SupportStatusDto,
} from './types';

const BASE_URL = import.meta.env.VITE_MIDDLEWARE_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// The caller's identity is resolved entirely server-side (middleware today;
// Entra ID token validation once real auth lands) — the frontend never supplies a
// user id, so there's nothing identity-related to attach to these requests.
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new ApiError(res.status, text || res.statusText);
  }

  return (await res.json()) as T;
}

export const api = {
  getDocuments: () => apiFetch<DocumentDto[]>('/api/documents'),
  getSections: () => apiFetch<SectionDto[]>('/api/sections'),
  getRoles: () => apiFetch<RoleDto[]>('/api/roles'),
  getSupportStatuses: () => apiFetch<SupportStatusDto[]>('/api/support-statuses'),
  getComments: () => apiFetch<CommentListItem[]>('/api/comments'),
  getComment: (id: string) => apiFetch<CommentDetailDto>(`/api/comments/${id}`),
  createComment: (body: Omit<CreateCommentRequest, 'userId'>) =>
    apiFetch<CommentDetailDto>('/api/comments', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
