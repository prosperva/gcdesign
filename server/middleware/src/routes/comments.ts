import { Router } from 'express';
import { dotnetFetch } from '../dotnetClient.js';
import { resolveUserId } from '../currentUser.js';
import type { CommentDetailDto, CommentListItemDto, CommentListItemWithDocument, CreateCommentRequest, DocumentDto } from '../types.js';

export const commentsRouter = Router();

// POST /api/comments — called when the user confirms their comment. The caller's userId
// is always overridden with the resolved identity, never trusted from the request body
// (the .NET API would ignore it anyway, but there's no reason to even send the spoofable
// value through).
commentsRouter.post('/comments', async (req, res, next) => {
  try {
    const userId = resolveUserId();
    const body = req.body as CreateCommentRequest;
    const created = await dotnetFetch<CommentDetailDto>('/api/comments', {
      method: 'POST',
      userId,
      body: { ...body, userId },
    });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// GET /api/comments — backs the comments list page. Joins in each comment's document
// title and link so the frontend can render a readable list without a second fetch.
commentsRouter.get('/comments', async (_req, res, next) => {
  try {
    const userId = resolveUserId();
    const [comments, documents] = await Promise.all([dotnetFetch<CommentListItemDto[]>('/api/comments', { userId }), dotnetFetch<DocumentDto[]>('/api/documents')]);
    const documentsById = new Map(documents.map(d => [d.id, d]));

    const enriched: CommentListItemWithDocument[] = comments.map(c => {
      const doc = documentsById.get(c.documentId);
      return {
        ...c,
        documentTitleEn: doc?.titleEn ?? null,
        documentTitleFr: doc?.titleFr ?? null,
        documentLink: doc?.documentLink ?? null,
      };
    });

    res.json(enriched);
  } catch (err) {
    next(err);
  }
});

commentsRouter.get('/comments/:id', async (req, res, next) => {
  try {
    const userId = resolveUserId();
    res.json(await dotnetFetch<CommentDetailDto>(`/api/comments/${req.params.id}`, { userId }));
  } catch (err) {
    next(err);
  }
});
