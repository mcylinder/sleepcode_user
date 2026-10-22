import { auth } from './firebase';

export class RequestError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function readJson<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new RequestError(
      (data as { error?: string }).error || 'Something went wrong. Please try again.',
      response.status,
    );
  }
  return data as T;
}

export async function authedFetch<T = unknown>(
  url: string,
  body?: unknown,
  { freshToken = false }: { freshToken?: boolean } = {},
): Promise<T> {
  const user = auth?.currentUser;
  if (!user) throw new RequestError('Please sign in first.', 401);

  const token = await user.getIdToken(freshToken);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body ?? {}),
  });

  return readJson<T>(response);
}

// Signs a session folder. Free sessions work signed out; paid still need a bearer token.
export async function fetchSessionMedia(sessionId: string): Promise<{ baseUrl: string; query: string }> {
  const user = auth?.currentUser;
  if (user) return authedFetch('/api/media/session', { sessionId });

  const response = await fetch('/api/media/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  });
  return readJson(response);
}
