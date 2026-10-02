import { auth } from './firebase';

export class RequestError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
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

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new RequestError(
      (data as { error?: string }).error || 'Something went wrong. Please try again.',
      response.status,
    );
  }
  return data as T;
}
