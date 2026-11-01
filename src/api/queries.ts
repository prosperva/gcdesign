import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { CreateCommentRequest } from './types';

// Lookup tables (documents, sections, roles, support statuses) change rarely — cache
// them for a few minutes instead of refetching on every mount/focus.
const LOOKUP_STALE_TIME = 5 * 60 * 1000;

export function useDocuments() {
  return useQuery({
    queryKey: ['documents'],
    queryFn: () => api.getDocuments(),
    staleTime: LOOKUP_STALE_TIME,
  });
}

export function useSections() {
  return useQuery({
    queryKey: ['sections'],
    queryFn: () => api.getSections(),
    staleTime: LOOKUP_STALE_TIME,
  });
}

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => api.getRoles(),
    staleTime: LOOKUP_STALE_TIME,
  });
}

export function useSupportStatuses() {
  return useQuery({
    queryKey: ['supportStatuses'],
    queryFn: () => api.getSupportStatuses(),
    staleTime: LOOKUP_STALE_TIME,
  });
}

export function useComments() {
  return useQuery({
    queryKey: ['comments'],
    queryFn: () => api.getComments(),
  });
}

export function useComment(id: string | undefined) {
  return useQuery({
    queryKey: ['comments', id],
    queryFn: () => api.getComment(id!),
    enabled: !!id,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Omit<CreateCommentRequest, 'userId'>) => api.createComment(body),
    onSuccess: () => {
      // The comments list (and any cached detail) is now stale — refetch on next view.
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
}
