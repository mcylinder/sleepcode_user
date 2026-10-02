import { auth } from './firebase';

export async function authedFetch<T = unknown>(
  url: string,
  body?: unknown,
  { freshToken = false }: { freshToken?: boolean } = {},
): Promise<T> {
  const user = auth?.currentUser;
  if (!user) throw new Error('Please sign in first.');

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
    throw new Error((data as { error?: string }).error || 'Something went wrong. Please try again.');
  }
  return data as T;
}
