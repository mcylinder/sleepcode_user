import { VOICES, type Session } from '@/lib/catalog';
import { signPrefix } from '@/lib/cloudfront';
import { buildScript, type ScriptConcept, type SessionManifest } from '@/lib/audio/playPlan';

const MANIFEST_TTL_SEC = 60 * 60;

/** Prefer Owen for public transcripts so wording matches the default voice. */
function transcriptVoiceId(): string | null {
  return VOICES[0]?.id ?? null;
}

export type SessionScriptResult =
  | { kind: 'ready'; concepts: ScriptConcept[] }
  | { kind: 'empty' }
  | { kind: 'unavailable' };

/** Server-side: sign CloudFront and load manifest.json for a session transcript. */
export async function loadSessionScript(session: Session): Promise<SessionScriptResult> {
  const voiceId = transcriptVoiceId();
  if (!voiceId) return { kind: 'unavailable' };

  try {
    const signed = signPrefix(`session/${voiceId}/${session.id}/`, MANIFEST_TTL_SEC);
    const response = await fetch(`${signed.baseUrl}manifest.json?${signed.query}`, {
      // Revalidate with the page's ISR window.
      next: { revalidate: 3600 },
    });
    if (!response.ok) return { kind: 'empty' };
    const concepts = buildScript((await response.json()) as SessionManifest);
    return concepts.length ? { kind: 'ready', concepts } : { kind: 'empty' };
  } catch {
    return { kind: 'unavailable' };
  }
}

export function transcriptIntro(session: Session): string {
  const lead = session.description.trim().replace(/\.$/, '');
  return `${lead}. Every word spoken in this SleepCode session is written below.`;
}
