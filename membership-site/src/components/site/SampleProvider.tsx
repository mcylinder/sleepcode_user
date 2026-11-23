'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { FEATURED_FREE_SESSION, mediaVoiceId } from '@/lib/catalog';
import { fetchSessionMedia } from '@/lib/authedFetch';
import { buildPlayPlan, buildScript, type SessionManifest } from '@/lib/audio/playPlan';
import { SessionEngine } from '@/lib/audio/SessionEngine';
import { loadPlayerPrefs, engineBalance, prefsPulseWidth } from '@/lib/playerPrefs';

export const SAMPLE_SECONDS = 25;
const SAMPLE_SIZE = 5;
const SAMPLE_FADE = 1.2;

interface SampleState {
  lines: string[];
  ready: boolean;
  playing: boolean;
  toggle: () => Promise<void>;
}

const SampleContext = createContext<SampleState>({ lines: [], ready: false, playing: false, toggle: async () => {} });

export const useSample = () => useContext(SampleContext);

// One short voice + pulse preview of the free session, shared by the hero rings and the
// "A sample" section so both controls drive the same audio.
export default function SampleProvider({ children }: { children: React.ReactNode }) {
  const free = FEATURED_FREE_SESSION;
  const [lines, setLines] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
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
        engine.setBalance(engineBalance(prefs.voiceMix));
        engine.setVolume(prefs.volume / 100);
        engine.setRepeat(1);
        engine.setPulseWidth(prefsPulseWidth(prefs));
        await engine.load(plan);
        if (!cancelled) setReady(true);
      } catch {
        // No sample; the page still works.
      }
    })();

    return () => {
      cancelled = true;
      if (stopTimer.current) clearTimeout(stopTimer.current);
      engine.dispose();
      engineRef.current = null;
    };
  }, [free]);

  const toggle = async () => {
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

  return <SampleContext.Provider value={{ lines, ready, playing, toggle }}>{children}</SampleContext.Provider>;
}
