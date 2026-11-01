import { config } from './config.js';

export class DotnetApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST';
  userId?: string;
  body?: unknown;
}

/** Thin fetch wrapper around the .NET API — the only place that knows its base URL. */
export async function dotnetFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', userId, body } = options;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (userId) headers['X-User-Id'] = userId;

  const res = await fetch(`${config.dotnetApiBaseUrl}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new DotnetApiError(res.status, text || res.statusText);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
