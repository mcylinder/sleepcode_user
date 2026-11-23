import { fetchSessionMedia } from '@/lib/authedFetch';
import { FEATURED_FREE_SESSION } from '@/lib/catalog';
import { buildPlayPlan, type SessionManifest } from '@/lib/audio/playPlan';

/** Signed URL for the first affirmation clip of Fresh Start in the given voice. */
export async function narratorPreviewUrl(voiceId: string): Promise<string | null> {
  const session = FEATURED_FREE_SESSION;
  if (!session) return null;
  const signed = await fetchSessionMedia(session.id, voiceId);
  const fileUrl = (name: string) => `${signed.baseUrl}${encodeURIComponent(name)}?${signed.query}`;
  const response = await fetch(fileUrl('manifest.json'));
  if (!response.ok) return null;
  const manifest = (await response.json()) as SessionManifest;
  const plan = buildPlayPlan(manifest, fileUrl);
  return plan.statementUrls[0] ?? null;
}
