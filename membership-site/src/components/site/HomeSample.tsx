'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { FEATURED_FREE_SESSION, mediaVoiceId, scriptHref } from '@/lib/catalog';
import { fetchSessionMedia } from '@/lib/authedFetch';
import { buildPlayPlan, buildScript, type SessionManifest } from '@/lib/audio/playPlan';
import { SessionEngine } from '@/lib/audio/SessionEngine';
import { loadPlayerPrefs, engineBalance } from '@/lib/playerPrefs';
import { PauseIcon, PlayIcon } from '@/components/ui/icons';

const SAMPLE_SIZE = 5;
const SAMPLE_SECONDS = 25;
const SAMPLE_FADE = 1.2;

// Written lines from the free-session manifest, plus a short voice+pulse preview.
export default function HomeSample() {
  const free = FEATURED_FREE_SESSION;
  const [lines, setLines] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const engineRef = useRef<SessionEngine | null>(null);
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!free) return;
    let cancelled = false;
    const engine = new SessionEngine();
    engine.onPlayingChange = setPlaying;
    engineRef.current = engine;

    (async () => {
      try {
        const prefs = loadPlayerPrefs();
        const voiceId = mediaVoiceId(prefs.voiceId);
        if (!voiceId) return;
        const signed = await fetchSessionMedia(free.id, voiceId);
        const fileUrl = (name: string) => `${signed.baseUrl}${encodeURIComponent(name)}?${signed.query}`;
        const response = await fetch(fileUrl('manifest.json'));
        if (!response.ok) return;
        const manifest = (await response.json()) as SessionManifest;
        const concepts = buildScript(manifest);
        if (!cancelled) setLines(concepts.slice(0, SAMPLE_SIZE).map((c) => c.lines[0]).filter(Boolean));

        const plan = buildPlayPlan(manifest, fileUrl);
        if (!plan.statementUrls.length) return;
        engine.setBalance(engineBalance(prefs.instruction));
        engine.setVolume(prefs.volume / 100);
        engine.setRepeat(1);
        engine.setPulseWidth(prefs.pulseWidth);
        await engine.load(plan);
        if (!cancelled) setReady(true);
      } catch {
        if (!cancelled) setLoadError(true);
      }
    })();

    return () => {
      cancelled = true;
      if (stopTimer.current) clearTimeout(stopTimer.current);
      engine.dispose();
      engineRef.current = null;
    };
  }, [free]);

  const toggleSample = async () => {
    const engine = engineRef.current;
    if (!engine?.ready) return;
    if (engine.playing) {
      if (stopTimer.current) clearTimeout(stopTimer.current);
      engine.fadeOutAndStop(SAMPLE_FADE);
      return;
    }
    await engine.play();
    if (stopTimer.current) clearTimeout(stopTimer.current);
    stopTimer.current = setTimeout(() => {
      engineRef.current?.fadeOutAndStop(SAMPLE_FADE);
    }, SAMPLE_SECONDS * 1000);
  };

  if (!free || (!lines.length && !ready && !loadError)) return null;
  if (!lines.length) return null;

  return (
    <section className="sc-section grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] items-start gap-[clamp(28px,5vw,72px)]">
      <div className="flex flex-col gap-[18px]">
        <span className="sc-eyebrow">A sample</span>
        <h2 className="sc-h-section">Every word, in plain sight.</h2>
        <p className="max-w-[28em] text-[16px] leading-[1.6] text-ink-muted">
          From {free.title} · {free.theme}. Read it here, or hear about {SAMPLE_SECONDS} seconds of voice and pulse.
        </p>
        <button
          type="button"
          onClick={() => void toggleSample()}
          disabled={!ready}
          className="sc-btn self-start disabled:opacity-40"
        >
          <span className="inline-flex items-center gap-2">
            {playing ? <PauseIcon size={14} /> : <PlayIcon size={14} className="translate-x-[1px]" />}
            {playing ? 'Stop sample' : ready ? 'Hear a sample' : 'Preparing sample\u2026'}
          </span>
        </button>
      </div>
      <div className="flex max-w-[620px] flex-col gap-5">
        <ul className="flex flex-col gap-3 text-[clamp(17px,1.6vw,20px)] leading-[1.55] text-ink-body">
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <Link href={scriptHref(free)} className="sc-link self-start text-[16px]">
          Read the transcript
        </Link>
      </div>
    </section>
  );
}
