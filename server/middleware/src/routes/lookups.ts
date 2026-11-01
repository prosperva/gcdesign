import { Router } from 'express';
import { dotnetFetch } from '../dotnetClient.js';
import type { DocumentDto, RoleDto, SectionDto, SupportStatusDto } from '../types.js';

export const lookupsRouter = Router();

lookupsRouter.get('/documents', async (_req, res, next) => {
  try {
    res.json(await dotnetFetch<DocumentDto[]>('/api/documents'));
  } catch (err) {
    next(err);
  }
});

lookupsRouter.get('/sections', async (_req, res, next) => {
  try {
    res.json(await dotnetFetch<SectionDto[]>('/api/sections'));
  } catch (err) {
    next(err);
  }
});

lookupsRouter.get('/roles', async (_req, res, next) => {
  try {
    res.json(await dotnetFetch<RoleDto[]>('/api/roles'));
  } catch (err) {
    next(err);
  }
});

lookupsRouter.get('/support-statuses', async (_req, res, next) => {
  try {
    res.json(await dotnetFetch<SupportStatusDto[]>('/api/support-statuses'));
  } catch (err) {
    next(err);
  }
});
