'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { findSession, isComingSoon, playerHref, saveLastPlayed, scriptHref, sessionLabel, type Session } from '@/lib/catalog';
import { fetchSessionMedia, RequestError } from '@/lib/authedFetch';
import { buildPlayPlan, type SessionManifest } from '@/lib/audio/playPlan';
import { SessionEngine } from '@/lib/audio/SessionEngine';
import { StayAwake } from '@/lib/audio/StayAwake';
import {
  DEFAULT_PREFS,
  LENGTH_HOURS,
  LENGTH_MINUTES,
  REPEAT_OPTIONS,
  engineBalance,
  formatHoursMinutes,
  loadPlayerPrefs,
  savePlayerPrefs,
  type PlayerPrefs,
  type RepeatCount,
} from '@/lib/playerPrefs';
import {
  canShowAccountPrompt,
  clearAccountPromptPending,
  hasAccountPromptPending,
  hasSeenPlayerIntro,
  markAccountPromptPending,
  markAccountPromptShownThisVisit,
} from '@/lib/visitFlags';

const LAST_PLAYED_AFTER_SEC = 60;
import BlendSlider from '@/components/ui/BlendSlider';
import Rings from '@/components/ui/Rings';
import Sheet, { SheetHeader } from '@/components/ui/Sheet';
import VolumeKnob from '@/components/ui/VolumeKnob';
import PlayerIntro from '@/components/ui/PlayerIntro';
import SaveSettingsPrompt from '@/components/ui/SaveSettingsPrompt';
import { NightShadeIcon, PauseIcon, PlayIcon, StopwatchIcon } from '@/components/ui/icons';

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
  const [load, setLoad] = useState<LoadState>({ kind: 'loading', loaded: 0, total: 0 });
  const [attempt, setAttempt] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [prefs, setPrefs] = useState<PlayerPrefs>(DEFAULT_PREFS);
  // Session length in seconds; 0 = plays until you stop.
  const [lengthSec, setLengthSec] = useState(0);
  const [remainingSec, setRemainingSec] = useState(0);
  const [ending, setEnding] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draftH, setDraftH] = useState(1);
  const [draftM, setDraftM] = useState(0);
  const [shadeOn, setShadeOn] = useState(false);
  const [introOpen, setIntroOpen] = useState(false);
  const [promptPending, setPromptPending] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const wasEnding = useRef(false);
  const listenedEnough = useRef(false);
  const lastPlayedSaved = useRef(false);
  const listenAccum = useRef(0);
  const sessionEndedCleanly = useRef(false);

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
    if (saved.lengthMinutes) {
      setLengthSec(saved.lengthMinutes * 60);
      setRemainingSec(saved.lengthMinutes * 60);
    }
    engine.setBalance(engineBalance(saved.instruction));
    engine.setVolume(saved.volume / 100);
    engine.setRepeat(saved.repeat);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') engine.resumeIfPlaying();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      engine.dispose();
      wake.dispose();
      engineRef.current = null;
      wakeRef.current = null;
    };
  }, []);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    let cancelled = false;
    setLoad({ kind: 'loading', loaded: 0, total: 0 });

    (async () => {
      try {
        const signed = await fetchSessionMedia(session.id);
        const fileUrl = (name: string) => `${signed.baseUrl}${encodeURIComponent(name)}?${signed.query}`;
        const response = await fetch(fileUrl('manifest.json'));
        if (!response.ok) throw new Error('This session\u2019s audio isn\u2019t available yet.');
        const plan = buildPlayPlan((await response.json()) as SessionManifest, fileUrl);
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
  }, [session, attempt, router]);

  // Count real listening time: last-played after 1 minute; pending account prompt if they leave mid-session.
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
    if (currentUser || !promptPending || shadeOn || playing || introOpen || sheetOpen) return;
    if (!canShowAccountPrompt()) {
      setPromptPending(false);
      clearAccountPromptPending();
      return;
    }
    clearAccountPromptPending();
    markAccountPromptShownThisVisit();
    setPromptOpen(true);
    setPromptPending(false);
  }, [currentUser, promptPending, shadeOn, playing, introOpen, sheetOpen]);

  useEffect(() => {
    if (ending) wasEnding.current = true;
  }, [ending]);

  useEffect(() => {
    if (!playing && wasEnding.current) {
      wasEnding.current = false;
      sessionEndedCleanly.current = true;
      if (!currentUser) setPromptPending(true);
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

  const updatePrefs = (patch: Partial<PlayerPrefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    savePlayerPrefs(next);
  };

  const setInstruction = (instruction: number) => {
    engineRef.current?.setBalance(engineBalance(instruction));
    updatePrefs({ instruction });
  };

  const setRepeat = (repeat: RepeatCount) => {
    engineRef.current?.setRepeat(repeat);
    updatePrefs({ repeat });
  };

  const setVolume = (volume: number) => {
    engineRef.current?.setVolume(volume / 100);
    updatePrefs({ volume });
  };

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
    wakeRef.current?.enable();
    await engine.play();
  };

  const ready = load.kind === 'ready';
  const hasLength = lengthSec > 0;
  const progress = hasLength ? 100 - (remainingSec / lengthSec) * 100 : 0;
  const draftMinutes = draftH * 60 + draftM;

  let status: ReactNode;
  if (load.kind === 'loading') {
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
    status = `Fading out \u00b7 ${session.theme}`;
  } else if (playing) {
    status = hasLength ? `Playing \u00b7 ${session.theme}` : 'Playing \u00b7 until you stop';
  } else {
    status = hasLength ? `Paused \u00b7 ${session.theme}` : 'Ready when you are';
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
          <button
            type="button"
            onClick={() => setIntroOpen(true)}
            aria-label="Before you start"
            title="Before you start"
            className="grid h-[44px] w-[44px] place-items-center rounded-full border border-p-chip-border font-mono text-[15px] text-p-fg"
          >
            ?
          </button>
          <button
            type="button"
            onClick={() => setShadeOn(true)}
            className="flex min-h-[44px] items-center gap-2 rounded-full border border-p-chip-border px-4 text-[14px] font-medium text-p-fg"
          >
            <NightShadeIcon />
            Night shade
          </button>
        </div>
      </div>

      <div className="mx-auto box-border flex w-full max-w-[520px] flex-1 flex-col items-center justify-center gap-[clamp(12px,2vh,22px)] px-[clamp(26px,4vw,48px)] pb-[calc(20px+env(safe-area-inset-bottom,0px))] [@media(min-height:760px)]:gap-3 [@media(min-height:760px)]:pb-4">
        <div className="w-[min(52vw,240px)] [@media(min-height:760px)]:w-[min(36vw,180px)]">
          <Rings color="var(--p-accent)" glowing={playing} restOpacity={0.26} />
        </div>

        <div className="flex flex-col gap-1 text-center">
          <h1 className="text-[clamp(24px,2.8vw,30px)] font-medium tracking-[-0.02em]">{label}</h1>
          <p className="text-[14px] text-p-muted" role="status">{status}</p>
          <Link href={scriptHref(session)} className="self-center pt-0.5 text-[13px] text-p-muted underline underline-offset-4">
            Read the script
          </Link>
        </div>

        <div className="flex min-h-[44px] w-full flex-col justify-center">
          {hasLength ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-3">
                <span className="flex items-baseline gap-2">
                  <span className="font-mono text-[24px] text-p-fg">
                    {formatHoursMinutes(Math.ceil(remainingSec / 60))}
                  </span>
                  <span className="text-[13px] text-p-muted">left</span>
                </span>
                <button
                  type="button"
                  onClick={openSheet}
                  className="py-2 text-[14px] font-medium text-p-muted underline underline-offset-4"
                >
                  Change
                </button>
              </div>
              <div className="h-[2px] rounded-sm bg-p-track">
                <div
                  className="h-[2px] rounded-sm bg-p-accent"
                  style={{ width: `${progress}%`, transition: 'width 1s linear' }}
                />
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={openSheet}
              className="flex min-h-[44px] items-center gap-[9px] self-center rounded-full border border-[rgba(231,225,214,0.24)] px-5 text-[15px] font-medium text-p-fg"
            >
              <StopwatchIcon />
              Set session length
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={togglePlay}
          disabled={!ready}
          aria-label={playing ? 'Pause' : 'Play'}
          className="grid h-[64px] w-[64px] flex-none place-items-center rounded-full border-[1.5px] border-p-accent text-p-fg disabled:opacity-40 [@media(min-height:760px)]:h-[56px] [@media(min-height:760px)]:w-[56px]"
        >
          {playing ? <PauseIcon size={18} /> : <PlayIcon size={18} className="translate-x-[2px]" />}
        </button>

        <BlendSlider instruction={prefs.instruction} onChange={setInstruction} tone="player" />

        <div className="grid w-full grid-cols-2 items-end gap-3">
          <div className="flex flex-col gap-2">
            <span className="text-[13px] text-p-muted" id="repeat-label">Each statement</span>
            <div className="flex gap-[6px]" role="radiogroup" aria-labelledby="repeat-label">
              {REPEAT_OPTIONS.map((count) => {
                const selected = prefs.repeat === count;
                return (
                  <button
                    key={count}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setRepeat(count)}
                    className={`min-h-[40px] flex-1 rounded-full border font-mono text-[13px] ${
                      selected ? 'border-p-accent bg-p-accent text-p-on-accent' : 'border-p-chip-border text-p-fg'
                    }`}
                  >
                    {count}&times;
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col items-center gap-1 justify-self-end">
            <span className="relative text-[13px] text-p-muted">
              <span className="invisible" aria-hidden="true">
                Volume <span className="font-mono">100%</span>
              </span>
              <span className="absolute inset-0">
                Volume <span className="font-mono tabular-nums">{prefs.volume}%</span>
              </span>
            </span>
            <VolumeKnob value={prefs.volume} onChange={setVolume} />
          </div>
        </div>
      </div>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} label="Session length" tone="player">
        <SheetHeader title="Session length" onCancel={() => setSheetOpen(false)} tone="player" />
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[44px] tracking-[-0.02em]">{formatHoursMinutes(draftMinutes)}</span>
          <span className="text-[14px] text-p-muted">
            {draftMinutes === 0 ? 'choose a length' : 'hours : minutes'}
          </span>
        </div>
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

      <PlayerIntro open={introOpen} onClose={() => setIntroOpen(false)} />
      <SaveSettingsPrompt
        open={promptOpen && !shadeOn && !introOpen}
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
