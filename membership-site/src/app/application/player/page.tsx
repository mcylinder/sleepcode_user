'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  VOICES,
  findSession,
  isComingSoon,
  playerHref,
  saveLastPlayed,
  sessionLabel,
  type Session,
} from '@/lib/catalog';
import { fetchSessionMedia, RequestError } from '@/lib/authedFetch';
import { buildPlayPlan, buildScript, type ScriptConcept, type SessionManifest } from '@/lib/audio/playPlan';
import { PulseWidthPreview } from '@/lib/audio/PulseWidthPreview';
import { SessionEngine } from '@/lib/audio/SessionEngine';
import { StayAwake } from '@/lib/audio/StayAwake';
import type { PulseWidth } from '@/lib/audio/pulseWidth';
import {
  DEFAULT_PREFS,
  LENGTH_HOURS,
  LENGTH_MINUTES,
  engineBalance,
  formatHoursMinutes,
  formatRemainingTitle,
  loadPlayerPrefs,
  savePlayerPrefs,
  type PlayerPrefs,
  type RepeatCount,
} from '@/lib/playerPrefs';
import { recordListenNight } from '@/lib/listenNights';
import {
  canShowAccountPrompt,
  clearAccountPromptPending,
  dismissAccountPrompt,
  hasAccountPromptPending,
  hasSeenPlayerIntro,
  markAccountPromptPending,
  markAccountPromptShownThisVisit,
} from '@/lib/visitFlags';

import ListenHistory from '@/components/ui/ListenHistory';
import PlayerTiles, { type PlayerPanel } from '@/components/ui/PlayerTiles';
import Rings from '@/components/ui/Rings';
import Sheet, { SheetHeader } from '@/components/ui/Sheet';
import PlayerIntro from '@/components/ui/PlayerIntro';
import StatementsOverlay from '@/components/ui/StatementsOverlay';
import SaveSettingsPrompt from '@/components/ui/SaveSettingsPrompt';
import VoicePicker from '@/components/ui/VoicePicker';
import { MoonIcon, PauseIcon, PlayIcon, StatementsIcon } from '@/components/ui/icons';

const LAST_PLAYED_AFTER_SEC = 60;
const LISTEN_NIGHT_AFTER_SEC = 180;
const FADE_OUT_SECONDS = 8;
const DEFAULT_SHEET_MINUTES = 60;

type LoadState =
  | { kind: 'loading'; loaded: number; total: number }
  | { kind: 'ready' }
  | { kind: 'error'; message: string };

export default function PlayerPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const found = findSession(new URLSearchParams(window.location.search).get('session'));
    // Beta: only free sessions are playable (no account required); the rest are Coming soon.
    if (!found || isComingSoon(found)) {
      router.replace('/application');
      return;
    }
    setSession(found);
  }, [router]);

  if (!session) {
    return <PlayerMessage text={'Loading\u2026'} />;
  }
  return <Player session={session} />;
}

const SITE_THEME_COLOR = '#ddd3c5';

function resolveCssColor(color: string): string {
  if (!color.startsWith('var(')) return color;
  const name = color.slice(4, -1).trim();
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || color;
}

function setThemeColor(color: string) {
  const metas = document.querySelectorAll('meta[name="theme-color"]');
  if (metas.length === 0) {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = color;
    document.head.appendChild(meta);
    return;
  }
  metas.forEach((meta) => meta.setAttribute('content', color));
}

// Mirrors the player background onto <html>/<body> and theme-color so iOS Safari/Chrome
// tint their header/footer chrome to match (night shade → black).
function usePageBackground(color: string) {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const previous = {
      htmlBg: html.style.background,
      bodyBg: body.style.background,
      htmlTransition: html.style.transition,
      bodyTransition: body.style.transition,
      colorScheme: html.style.colorScheme,
      themeColor: document.querySelector('meta[name="theme-color"]')?.getAttribute('content'),
    };
    html.style.transition = 'background 2.6s ease';
    body.style.transition = 'background 2.6s ease';
    html.style.colorScheme = 'dark';
    return () => {
      html.style.background = previous.htmlBg;
      body.style.background = previous.bodyBg;
      html.style.transition = previous.htmlTransition;
      body.style.transition = previous.bodyTransition;
      html.style.colorScheme = previous.colorScheme;
      setThemeColor(previous.themeColor || SITE_THEME_COLOR);
    };
  }, []);

  useEffect(() => {
    const resolved = resolveCssColor(color);
    document.documentElement.style.background = resolved;
    document.body.style.background = resolved;
    setThemeColor(resolved);
  }, [color]);
}

function Player({ session }: { session: Session }) {
  const router = useRouter();
  const { currentUser } = useAuth();
  const engineRef = useRef<SessionEngine | null>(null);
  const wakeRef = useRef<StayAwake | null>(null);
  const previewRef = useRef<PulseWidthPreview | null>(null);
  const pulseUrlRef = useRef<string | null>(null);
  const [load, setLoad] = useState<LoadState>({ kind: 'loading', loaded: 0, total: 0 });
  const [attempt, setAttempt] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [prefs, setPrefs] = useState<PlayerPrefs>(DEFAULT_PREFS);
  // Session length in seconds; 0 = plays until you stop.
  const [lengthSec, setLengthSec] = useState(0);
  const [remainingSec, setRemainingSec] = useState(0);
  const [ending, setEnding] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [panel, setPanel] = useState<PlayerPanel>(null);
  const [draftH, setDraftH] = useState(1);
  const [draftM, setDraftM] = useState(0);
  const [shadeOn, setShadeOn] = useState(false);
  const [introOpen, setIntroOpen] = useState(false);
  const [statementsOpen, setStatementsOpen] = useState(false);
  const [script, setScript] = useState<ScriptConcept[]>([]);
  const [promptPending, setPromptPending] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [voiceReady, setVoiceReady] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);
  const wasEnding = useRef(false);
  const listenedEnough = useRef(false);
  const lastPlayedSaved = useRef(false);
  const nightRecorded = useRef(false);
  const listenAccum = useRef(0);
  const sessionEndedCleanly = useRef(false);
  const promptOpenRef = useRef(false);
  promptOpenRef.current = promptOpen;

  usePageBackground(shadeOn ? '#000000' : playing ? 'var(--p-bg-playing)' : 'var(--p-bg)');

  useEffect(() => {
    setIntroOpen(!hasSeenPlayerIntro());
    // Mid-session leave last time → offer account on this visit (once idle).
    if (!currentUser && hasAccountPromptPending() && canShowAccountPrompt()) {
      setPromptPending(true);
    }
  }, [currentUser]);

  useEffect(() => {
    const engine = new SessionEngine();
    const wake = new StayAwake();
    engine.onPlayingChange = setPlaying;
    engineRef.current = engine;
    wakeRef.current = wake;

    const saved = loadPlayerPrefs();
    setPrefs(saved);
    setVoiceReady(Boolean(saved.voiceId));
    if (saved.lengthMinutes) {
      setLengthSec(saved.lengthMinutes * 60);
      setRemainingSec(saved.lengthMinutes * 60);
    }
    engine.setBalance(engineBalance(saved.instruction));
    engine.setVolume(saved.volume / 100);
    engine.setRepeat(saved.repeat);
    engine.setPulseWidth(saved.pulseWidth);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') engine.resumeIfPlaying();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      engine.dispose();
      wake.dispose();
      previewRef.current?.dispose();
      previewRef.current = null;
      engineRef.current = null;
      wakeRef.current = null;
    };
  }, []);

  useEffect(() => {
    const engine = engineRef.current;
    const voiceId = prefs.voiceId;
    if (!engine || !voiceReady || !voiceId) return;
    let cancelled = false;
    setLoad({ kind: 'loading', loaded: 0, total: 0 });

    (async () => {
      try {
        const signed = await fetchSessionMedia(session.id, voiceId);
        const fileUrl = (name: string) => `${signed.baseUrl}${encodeURIComponent(name)}?${signed.query}`;
        const response = await fetch(fileUrl('manifest.json'));
        if (!response.ok) throw new Error('This session\u2019s audio isn\u2019t available yet.');
        const manifest = (await response.json()) as SessionManifest;
        const plan = buildPlayPlan(manifest, fileUrl);
        if (!cancelled) {
          setScript(buildScript(manifest));
          pulseUrlRef.current = plan.pulseUrl;
        }
        if (!plan.statementUrls.length) throw new Error('This session\u2019s audio isn\u2019t available yet.');
        if (cancelled) return;

        await engine.load(plan, (loaded, total) => {
          if (!cancelled) setLoad({ kind: 'loading', loaded, total });
        });
        if (cancelled) return;
        setLoad({ kind: 'ready' });
      } catch (error) {
        if (cancelled) return;
        if (error instanceof RequestError && error.status === 403) {
          router.replace('/application');
          return;
        }
        setLoad({
          kind: 'error',
          message: error instanceof Error ? error.message : 'This session couldn\u2019t load. Please try again.',
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session, attempt, router, voiceReady, prefs.voiceId]);

  function chooseVoice(voiceId: string) {
    const next = { ...loadPlayerPrefs(), voiceId };
    savePlayerPrefs(next);
    setPrefs(next);
    setVoiceReady(true);
  }

  // Count real listening time: last-played after 1 minute; night after 3 minutes.
  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      listenAccum.current += (now - last) / 1000;
      last = now;
      if (listenAccum.current >= LAST_PLAYED_AFTER_SEC) {
        listenedEnough.current = true;
        if (!lastPlayedSaved.current) {
          lastPlayedSaved.current = true;
          saveLastPlayed(session);
        }
      }
      if (listenAccum.current >= LISTEN_NIGHT_AFTER_SEC && !nightRecorded.current) {
        nightRecorded.current = true;
        recordListenNight();
        setHistoryKey((n) => n + 1);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [playing, session]);

  useEffect(() => {
    return () => {
      if (!currentUser && listenedEnough.current && !sessionEndedCleanly.current && canShowAccountPrompt()) {
        markAccountPromptPending();
      }
    };
  }, [currentUser]);

  // After a finished session (or a pending mid-session leave), offer account once idle.
  useEffect(() => {
    if (
      currentUser ||
      !promptPending ||
      shadeOn ||
      playing ||
      introOpen ||
      sheetOpen ||
      panel !== null ||
      statementsOpen
    ) {
      return;
    }
    if (!canShowAccountPrompt()) {
      setPromptPending(false);
      clearAccountPromptPending();
      return;
    }
    clearAccountPromptPending();
    markAccountPromptShownThisVisit();
    setPromptOpen(true);
    setPromptPending(false);
  }, [currentUser, promptPending, shadeOn, playing, introOpen, sheetOpen, panel, statementsOpen]);

  // Leaving the player while the prompt is up counts as "Not now" (7-day dismiss).
  useEffect(() => {
    return () => {
      if (promptOpenRef.current) dismissAccountPrompt();
    };
  }, []);

  useEffect(() => {
    if (ending) wasEnding.current = true;
  }, [ending]);

  useEffect(() => {
    if (!playing && wasEnding.current) {
      wasEnding.current = false;
      sessionEndedCleanly.current = true;
      if (!currentUser && listenedEnough.current) setPromptPending(true);
    }
  }, [playing, currentUser]);

  // Count down only while playing with a length set. Measured against the clock so a
  // throttled timer doesn't drift.
  const counting = playing && lengthSec > 0 && !ending;
  useEffect(() => {
    if (!counting) return;
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      const elapsed = (now - last) / 1000;
      last = now;
      setRemainingSec((sec) => Math.max(0, sec - elapsed));
    }, 1000);
    return () => clearInterval(id);
  }, [counting]);

  useEffect(() => {
    if (counting && remainingSec <= 0) {
      setEnding(true);
      engineRef.current?.fadeOutAndPause(FADE_OUT_SECONDS);
    }
  }, [counting, remainingSec]);

  // Once the end-of-length fade has paused playback, the length is spent.
  useEffect(() => {
    if (!playing && ending) {
      setEnding(false);
      setLengthSec(0);
      setRemainingSec(0);
    }
  }, [playing, ending]);

  useEffect(() => {
    if (!playing) wakeRef.current?.disable();
  }, [playing]);

  // Width panel: if the session is already playing, hear width on the live engine.
  // Only start a separate pulse demo when idle.
  useEffect(() => {
    if (panel !== 'width') {
      previewRef.current?.stop();
      return;
    }
    const engine = engineRef.current;
    if (engine?.playing) {
      previewRef.current?.stop();
      return;
    }
    let cancelled = false;
    (async () => {
      const preview = previewRef.current ?? new PulseWidthPreview();
      previewRef.current = preview;
      const current = loadPlayerPrefs();
      preview.setPrefsVolume(current.volume, current.instruction);
      preview.setWidth(current.pulseWidth);
      const url = pulseUrlRef.current;
      if (!url || cancelled) return;
      try {
        await preview.start(url);
      } catch {
        // Panel still usable without audio.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [panel, playing]);

  const updatePrefs = (patch: Partial<PlayerPrefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    savePlayerPrefs(next);
  };

  const setInstruction = (instruction: number) => {
    engineRef.current?.setBalance(engineBalance(instruction));
    if (panel === 'width') previewRef.current?.setPrefsVolume(prefs.volume, instruction);
    updatePrefs({ instruction });
  };

  const setRepeat = (repeat: RepeatCount) => {
    engineRef.current?.setRepeat(repeat);
    updatePrefs({ repeat });
  };

  const setVolume = (volume: number) => {
    engineRef.current?.setVolume(volume / 100);
    if (panel === 'width') previewRef.current?.setPrefsVolume(volume, prefs.instruction);
    updatePrefs({ volume });
  };

  function chooseWidth(pulseWidth: PulseWidth) {
    engineRef.current?.setPulseWidth(pulseWidth);
    previewRef.current?.setWidth(pulseWidth);
    updatePrefs({ pulseWidth });
  }

  const cancelEnding = () => {
    if (!ending) return;
    setEnding(false);
    if (engineRef.current?.playing) void engineRef.current.play();
  };

  const applyLength = (minutes: number) => {
    cancelEnding();
    setLengthSec(minutes * 60);
    setRemainingSec(minutes * 60);
    updatePrefs({ lengthMinutes: minutes > 0 ? minutes : null });
    setSheetOpen(false);
  };

  const openSheet = () => {
    setPanel(null);
    let minutes = prefs.lengthMinutes ?? DEFAULT_SHEET_MINUTES;
    if (lengthSec > 0) minutes = Math.ceil(remainingSec / 60);
    const hours = Math.min(10, Math.floor(minutes / 60));
    setDraftH(hours);
    setDraftM(Math.min(50, Math.round((minutes % 60) / 10) * 10));
    setSheetOpen(true);
  };

  const togglePlay = async () => {
    const engine = engineRef.current;
    if (!engine?.ready) return;
    if (engine.playing) {
      await engine.pause();
      return;
    }
    // Starting session playback: drop any idle width demo so they don't overlap.
    previewRef.current?.stop();
    wakeRef.current?.enable();
    await engine.play();
  };

  const ready = load.kind === 'ready';
  const hasLength = lengthSec > 0;
  const draftMinutes = draftH * 60 + draftM;
  const lengthTitle =
    hasLength && remainingSec > 0 ? formatRemainingTitle(remainingSec) : 'Session length';

  let status: ReactNode = null;
  if (!voiceReady) {
    status = 'Choose a voice';
  } else if (load.kind === 'loading') {
    status = load.total ? `Loading ${load.loaded} of ${load.total}` : 'Preparing session\u2026';
  } else if (load.kind === 'error') {
    status = (
      <>
        {load.message}{' '}
        <button type="button" onClick={() => setAttempt((n) => n + 1)} className="font-semibold text-p-fg underline underline-offset-4">
          Try again
        </button>
      </>
    );
  } else if (ending) {
    status = 'Fading out';
  }

  const label = sessionLabel(session);

  return (
    <main
      className="flex min-h-screen min-h-[100dvh] flex-col text-p-fg"
      style={{ background: playing ? 'var(--p-bg-playing)' : 'var(--p-bg)', transition: 'background 2.6s ease' }}
    >
      <div className="flex items-center justify-between gap-3 px-[clamp(22px,4vw,48px)] pb-3 pt-[calc(12px+env(safe-area-inset-top,0px))] text-[15px] text-p-muted [@media(min-height:760px)]:pb-2 [@media(min-height:760px)]:pt-[calc(8px+env(safe-area-inset-top,0px))]">
        <Link href="/application" className="flex min-h-[44px] items-center">&lsaquo; Back</Link>
        <div className="flex items-center gap-2">
          {script.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setPanel(null);
                setStatementsOpen(true);
              }}
              aria-label="Transcript"
              title="Transcript"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-full border border-p-chip-border px-3 text-[14px] font-medium text-p-fg sm:px-4"
            >
              <StatementsIcon />
              <span className="hidden sm:inline">Transcript</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setPanel(null);
              setIntroOpen(true);
            }}
            aria-label="Before you start"
            title="Before you start"
            className="grid h-[44px] w-[44px] place-items-center rounded-full border border-p-chip-border font-mono text-[15px] text-p-fg"
          >
            ?
          </button>
          <button
            type="button"
            onClick={() => {
              setPanel(null);
              setShadeOn(true);
            }}
            className="flex min-h-[44px] items-center gap-2 rounded-full border border-p-chip-border px-4 text-[14px] font-medium text-p-fg"
          >
            <MoonIcon />
            Night shade
          </button>
        </div>
      </div>

      <div className="mx-auto box-border flex w-full max-w-[520px] flex-1 flex-col items-center px-[clamp(22px,4vw,48px)] pb-[calc(16px+env(safe-area-inset-bottom,0px))]">
        <div
          className="flex w-full flex-1 flex-col items-center"
          onClick={panel ? () => setPanel(null) : undefined}
        >
          <div className="flex w-full flex-col items-center gap-5 pt-1">
            {/* Height-capped so larger rings don’t shove tiles off short screens. */}
            <div style={{ width: 'min(72vw, 42dvh, 300px)' }}>
              <Rings color="var(--p-accent)" glowing={playing} restOpacity={0.26}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    void togglePlay();
                  }}
                  disabled={!ready}
                  aria-label={playing ? 'Pause' : 'Play'}
                  className="grid h-[84px] w-[84px] place-items-center rounded-full bg-p-accent text-p-on-accent disabled:opacity-40"
                >
                  {playing ? <PauseIcon size={27} /> : <PlayIcon size={27} className="translate-x-[3px]" />}
                </button>
              </Rings>
            </div>

            <h1 className="text-[clamp(24px,2.8vw,30px)] font-medium tracking-[-0.02em]">{label}</h1>

            <div className="flex flex-col items-center gap-2">
              <ListenHistory refreshKey={historyKey} />
              <p className="min-h-[20px] text-center text-[14px] text-p-muted" role="status">
                {status}
              </p>
            </div>
          </div>

          <div className="flex-1" />
        </div>

        <div className="w-full" onClick={(e) => e.stopPropagation()}>
          <PlayerTiles
            open={panel}
            onOpenChange={setPanel}
            lengthMinutes={prefs.lengthMinutes}
            instruction={prefs.instruction}
            pulseWidth={prefs.pulseWidth}
            repeat={prefs.repeat}
            volume={prefs.volume}
            onOpenLength={openSheet}
            onInstruction={setInstruction}
            onPulseWidth={chooseWidth}
            onRepeat={setRepeat}
            onVolume={setVolume}
          />
        </div>
      </div>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} label={lengthTitle} tone="player">
        <SheetHeader title={lengthTitle} onCancel={() => setSheetOpen(false)} tone="player" />
        <div className="font-mono text-[44px] tracking-[-0.02em]">{formatHoursMinutes(draftMinutes)}</div>
        <ChipGrid
          label="Hours"
          options={LENGTH_HOURS}
          value={draftH}
          format={(h) => String(h)}
          onChange={setDraftH}
        />
        <ChipGrid
          label="Minutes"
          options={LENGTH_MINUTES}
          value={draftM}
          format={(m) => String(m).padStart(2, '0')}
          onChange={setDraftM}
        />
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={() => applyLength(draftMinutes)}
            disabled={draftMinutes === 0}
            className="min-h-[48px] rounded-full bg-p-accent px-[26px] text-[15px] font-semibold text-p-on-accent disabled:opacity-40"
          >
            Set length
          </button>
        </div>
      </Sheet>

      <Sheet
        open={!voiceReady}
        onClose={() => router.replace('/application')}
        label="Choose a voice"
        tone="player"
      >
        <SheetHeader title="Choose a voice" onCancel={() => router.replace('/application')} tone="player" />
        <p className="text-[14px] leading-snug text-p-muted">
          This preference applies to every session. You can change it later in Account.
        </p>
        <VoicePicker voices={VOICES} selectedId={prefs.voiceId} onSelect={chooseVoice} tone="player" />
      </Sheet>

      <PlayerIntro open={introOpen && voiceReady} onClose={() => setIntroOpen(false)} />
      <StatementsOverlay
        open={statementsOpen && !shadeOn && voiceReady}
        onClose={() => setStatementsOpen(false)}
        title={label}
        concepts={script}
      />
      <SaveSettingsPrompt
        open={promptOpen && !shadeOn && !introOpen && !statementsOpen && voiceReady}
        onClose={() => setPromptOpen(false)}
        nextHref={playerHref(session)}
      />

      <button
        type="button"
        onClick={() => setShadeOn(false)}
        aria-hidden={!shadeOn}
        tabIndex={shadeOn ? 0 : -1}
        aria-label="Wake screen"
        className="fixed inset-0 z-50 flex items-end justify-center bg-black pb-10"
        style={{ opacity: shadeOn ? 1 : 0, pointerEvents: shadeOn ? 'auto' : 'none', transition: 'opacity 2.4s ease' }}
      >
        <span className="text-[13px] text-[#2a2a2a]">Tap to wake</span>
      </button>
    </main>
  );
}

function ChipGrid({
  label,
  options,
  value,
  format,
  onChange,
}: {
  label: string;
  options: number[];
  value: number;
  format: (option: number) => string;
  onChange: (option: number) => void;
}) {
  return (
    <div className="flex flex-col gap-[10px]">
      <span className="text-[13px] text-p-muted">{label}</span>
      <div className="grid grid-cols-6 gap-[6px]" role="radiogroup" aria-label={label}>
        {options.map((option) => {
          const selected = option === value;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option)}
              className={`min-h-[44px] rounded-[12px] border font-mono text-[14px] ${
                selected
                  ? 'border-p-accent bg-p-accent text-p-on-accent'
                  : 'border-[rgba(231,225,214,0.16)] text-p-fg'
              }`}
            >
              {format(option)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PlayerMessage({ text }: { text: string }) {
  usePageBackground('var(--p-bg)');
  return (
    <main className="flex min-h-screen min-h-[100dvh] items-center justify-center bg-p-bg">
      <p className="text-[14px] text-p-muted">{text}</p>
    </main>
  );
}
