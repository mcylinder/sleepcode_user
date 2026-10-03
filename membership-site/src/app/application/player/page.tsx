'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useMembership } from '@/hooks/useMembership';
import { findSession, isLocked, saveLastPlayed, type Session } from '@/lib/catalog';
import { authedFetch, RequestError } from '@/lib/authedFetch';
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
import BlendSlider from '@/components/ui/BlendSlider';
import Rings from '@/components/ui/Rings';
import Sheet, { SheetHeader } from '@/components/ui/Sheet';
import { NightShadeIcon, PauseIcon, PlayIcon, StopwatchIcon } from '@/components/ui/icons';

const FADE_OUT_SECONDS = 8;
const DEFAULT_SHEET_MINUTES = 60;

interface SignedMedia {
  baseUrl: string;
  query: string;
}

type LoadState =
  | { kind: 'loading'; loaded: number; total: number }
  | { kind: 'ready' }
  | { kind: 'error'; message: string };

const lockedHref = (session: Session) => `/application?locked=${encodeURIComponent(session.id)}`;

export default function PlayerPage() {
  const { currentUser } = useAuth();
  const { isMember, loading: membershipLoading } = useMembership();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!currentUser) {
      router.replace(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    const found = findSession(new URLSearchParams(window.location.search).get('session'));
    if (!found) {
      router.replace('/application');
      return;
    }
    setSession(found);
  }, [currentUser, router]);

  const locked = !!session && !membershipLoading && isLocked(session, isMember);
  useEffect(() => {
    if (session && locked) router.replace(lockedHref(session));
  }, [session, locked, router]);

  if (!currentUser || !session || membershipLoading || locked) {
    return <PlayerMessage text={'Loading\u2026'} />;
  }
  return <Player session={session} />;
}

// Mirrors the player background onto <html> and <body> so overscroll and safe areas match.
function usePageBackground(color: string) {
  useEffect(() => {
    const targets = [document.documentElement, document.body];
    const previous = targets.map((el) => [el.style.background, el.style.transition] as const);
    targets.forEach((el) => (el.style.transition = 'background 2.6s ease'));
    return () => {
      targets.forEach((el, i) => {
        el.style.background = previous[i][0];
        el.style.transition = previous[i][1];
      });
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.background = color;
    document.body.style.background = color;
  }, [color]);
}

function Player({ session }: { session: Session }) {
  const router = useRouter();
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

  usePageBackground(playing ? 'var(--p-bg-playing)' : 'var(--p-bg)');

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
        const signed = await authedFetch<SignedMedia>('/api/media/session', { sessionId: session.id });
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
        saveLastPlayed(session);
        setLoad({ kind: 'ready' });
      } catch (error) {
        if (cancelled) return;
        if (error instanceof RequestError && error.status === 403) {
          router.replace(lockedHref(session));
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
    status = hasLength ? `Paused \u00b7 ${session.theme}` : `${session.theme} \u00b7 ready when you are`;
  }

  return (
    <main
      className="flex min-h-screen min-h-[100dvh] flex-col text-p-fg"
      style={{ background: playing ? 'var(--p-bg-playing)' : 'var(--p-bg)', transition: 'background 2.6s ease' }}
    >
      <div className="flex items-center justify-between gap-3 px-[clamp(22px,4vw,48px)] pb-[18px] pt-[calc(18px+env(safe-area-inset-top,0px))] text-[15px] text-p-muted">
        <Link href="/application" className="flex min-h-[44px] items-center">&lsaquo; Back</Link>
        <div className="flex items-center gap-2">
          <a
            href="/how-to-listen"
            target="_blank"
            rel="noopener"
            aria-label="How to listen (opens in a new tab)"
            title="How to listen"
            className="grid h-[44px] w-[44px] place-items-center rounded-full border border-p-chip-border font-mono text-[15px] text-p-fg"
          >
            ?
          </a>
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

      <div className="mx-auto box-border flex w-full max-w-[520px] flex-1 flex-col items-center justify-center gap-[clamp(16px,2.2vw,26px)] px-[clamp(26px,4vw,48px)] pb-[calc(30px+env(safe-area-inset-bottom,0px))]">
        <div className="w-[min(60vw,280px)]">
          <Rings color="var(--p-accent)" glowing={playing} restOpacity={0.26} />
        </div>

        <div className="flex flex-col gap-[6px] text-center">
          <h1 className="text-[clamp(26px,3vw,32px)] font-medium tracking-[-0.02em]">{session.title}</h1>
          <p className="text-[14px] text-p-muted" role="status">{status}</p>
        </div>

        <div className="flex min-h-[52px] w-full flex-col justify-center">
          {hasLength ? (
            <div className="flex flex-col gap-[10px]">
              <div className="flex items-baseline justify-between gap-3">
                <span className="flex items-baseline gap-2">
                  <span className="font-mono text-[26px] text-p-fg">
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
          className="grid h-[72px] w-[72px] flex-none place-items-center rounded-full border-[1.5px] border-p-accent text-p-fg disabled:opacity-40"
        >
          {playing ? <PauseIcon size={20} /> : <PlayIcon size={20} className="translate-x-[2px]" />}
        </button>

        <BlendSlider instruction={prefs.instruction} onChange={setInstruction} tone="player" />

        <div className="flex w-full flex-col gap-[10px]">
          <span className="text-[13px] text-p-muted" id="repeat-label">Repeat</span>
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
