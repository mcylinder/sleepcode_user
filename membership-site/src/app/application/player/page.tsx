'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useMembership } from '@/hooks/useMembership';
import { findSession, isLocked, saveLastSession, type Session } from '@/lib/catalog';
import { authedFetch, RequestError } from '@/lib/authedFetch';
import { buildPlayPlan, type SessionManifest } from '@/lib/audio/playPlan';
import { SessionEngine } from '@/lib/audio/SessionEngine';
import { StayAwake } from '@/lib/audio/StayAwake';
import {
  DEFAULT_PREFS,
  REPEAT_OPTIONS,
  TIMER_PRESETS,
  formatDuration,
  loadPlayerPrefs,
  savePlayerPrefs,
  type PlayerPrefs,
  type RepeatCount,
} from '@/lib/playerPrefs';
import BackHeader from '@/components/ui/BackHeader';
import Sheet from '@/components/ui/Sheet';
import { HEAD_PATH } from '@/components/ui/icons';

const FADE_OUT_SECONDS = 8;
const DEFAULT_SHEET_MINUTES = 180;

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

function Player({ session }: { session: Session }) {
  const router = useRouter();
  const engineRef = useRef<SessionEngine | null>(null);
  const wakeRef = useRef<StayAwake | null>(null);
  const [load, setLoad] = useState<LoadState>({ kind: 'loading', loaded: 0, total: 0 });
  const [attempt, setAttempt] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [prefs, setPrefs] = useState<PlayerPrefs>(DEFAULT_PREFS);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [ended, setEnded] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draftMinutes, setDraftMinutes] = useState(DEFAULT_SHEET_MINUTES);
  const [nightShade, setNightShade] = useState(false);

  useEffect(() => {
    const engine = new SessionEngine();
    const wake = new StayAwake();
    engine.onPlayingChange = setPlaying;
    engineRef.current = engine;
    wakeRef.current = wake;

    const saved = loadPlayerPrefs();
    setPrefs(saved);
    setRemainingMs(saved.timerMinutes ? saved.timerMinutes * 60_000 : null);
    engine.setBalance(saved.blend);
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
        saveLastSession(session);
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

  const timerActive = remainingMs !== null;
  useEffect(() => {
    if (!playing || !timerActive) return;
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      const elapsed = now - last;
      last = now;
      setRemainingMs((ms) => (ms === null ? null : Math.max(0, ms - elapsed)));
    }, 250);
    return () => clearInterval(id);
  }, [playing, timerActive]);

  useEffect(() => {
    if (remainingMs === 0 && playing) {
      engineRef.current?.fadeOutAndStop(FADE_OUT_SECONDS);
      setEnded(true);
    }
  }, [remainingMs, playing]);

  useEffect(() => {
    if (!playing) wakeRef.current?.disable();
  }, [playing]);

  const updatePrefs = (patch: Partial<PlayerPrefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    savePlayerPrefs(next);
  };

  const setBlend = (value: number) => {
    const blend = Math.min(100, Math.max(0, Math.round(value)));
    engineRef.current?.setBalance(blend);
    updatePrefs({ blend });
  };

  const setRepeat = (repeat: RepeatCount) => {
    engineRef.current?.setRepeat(repeat);
    updatePrefs({ repeat });
  };

  const applyTimer = (minutes: number | null) => {
    updatePrefs({ timerMinutes: minutes });
    setRemainingMs(minutes ? minutes * 60_000 : null);
    setEnded(false);
    setSheetOpen(false);
  };

  const togglePlay = async () => {
    const engine = engineRef.current;
    if (!engine?.ready) return;
    if (engine.playing) {
      await engine.pause();
      return;
    }
    if (remainingMs === 0 && prefs.timerMinutes) setRemainingMs(prefs.timerMinutes * 60_000);
    setEnded(false);
    wakeRef.current?.enable();
    await engine.play();
  };

  const totalMs = prefs.timerMinutes ? prefs.timerMinutes * 60_000 : 0;
  const progress = totalMs && remainingMs !== null ? ((totalMs - remainingMs) / totalMs) * 100 : 0;
  const ready = load.kind === 'ready';
  const presets = TIMER_PRESETS.includes(draftMinutes)
    ? TIMER_PRESETS
    : [...TIMER_PRESETS, draftMinutes].sort((a, b) => a - b);

  let status: ReactNode = null;
  if (load.kind === 'loading') {
    status = load.total ? `Loading ${load.loaded} of ${load.total}` : 'Preparing session\u2026';
  } else if (load.kind === 'error') {
    status = (
      <>
        {load.message}{' '}
        <button type="button" onClick={() => setAttempt((n) => n + 1)} className="sc-link">
          Try again
        </button>
      </>
    );
  } else if (ended) {
    status = 'Session complete';
  }

  return (
    <main className="sc-frame">
      {nightShade && (
        <button
          type="button"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black pb-10"
          onClick={() => setNightShade(false)}
          aria-label="Exit Night Shade"
        >
          <span className="text-[12px] text-fg-faint opacity-60">Tap anywhere to exit Night Shade</span>
        </button>
      )}

      <BackHeader href="/application" />

      <div className="flex flex-1 flex-col items-center justify-center wide:py-10">
        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col items-center justify-center gap-[22px] px-8 py-6">
          <div className="text-center">
            <div className="sc-eyebrow--muted">Tonight</div>
            <h1 className="mt-2 text-[25px] font-semibold">{session.title}</h1>
          </div>

          <Orb progress={progress} playing={playing} />

          <p className="-mt-2 min-h-[18px] text-center text-[12px] text-fg-faint" role="status">
            {status}
          </p>

          <div className="flex w-full max-w-[268px] flex-col gap-[9px]">
            <div className="flex justify-between">
              <span className="sc-eyebrow--muted text-[10px]">Instruction</span>
              <span className="sc-eyebrow--muted text-[10px]">Pulses</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setBlend(prefs.blend - 5)}
                disabled={prefs.blend <= 0}
                aria-label="More instruction"
                className="flex-shrink-0"
              >
                <VoiceIcon />
              </button>
              <HairlineSlider label="Instruction to pulse blend" value={prefs.blend} min={0} max={100} step={5} onChange={setBlend} />
              <button
                type="button"
                onClick={() => setBlend(prefs.blend + 5)}
                disabled={prefs.blend >= 100}
                aria-label="More pulse"
                className="flex-shrink-0"
              >
                <svg width="26" height="17" viewBox="0 0 22 14" fill="var(--signal)" aria-hidden="true">
                  <rect x="1" y="3" width="5" height="8" rx="1" opacity="0.45" />
                  <rect x="9" y="0" width="5" height="14" rx="1" />
                  <rect x="17" y="3" width="5" height="8" rx="1" opacity="0.45" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mt-[10px] flex w-full max-w-[268px] flex-col gap-[9px]">
            <span className="sc-eyebrow--muted text-[10px]">Repeat Each Instruction</span>
            <div className="flex gap-2" role="radiogroup" aria-label="Repeat each instruction">
              {REPEAT_OPTIONS.map((count) => (
                <button
                  key={count}
                  type="button"
                  role="radio"
                  aria-checked={prefs.repeat === count}
                  onClick={() => setRepeat(count)}
                  className={`sc-chip flex-1 px-0 text-center ${prefs.repeat === count ? 'is-selected' : ''}`}
                >
                  {count}&times;
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-center gap-[34px] px-6 pb-14">
          <div className="flex w-[72px] flex-col items-center gap-[9px]">
            <span className="sc-eyebrow--muted text-[10px]">Session</span>
            <button
              type="button"
              onClick={() => {
                setDraftMinutes(prefs.timerMinutes ?? DEFAULT_SHEET_MINUTES);
                setSheetOpen(true);
              }}
              aria-label="Session length"
              className="inline-flex min-w-[52px] items-center justify-center rounded-2xl border border-line px-4 py-[7px]"
            >
              <span className="font-mono text-[12px] tracking-[0.02em] text-fg-muted tabular-nums">
                {remainingMs === null ? 'Set' : `-${formatClock(remainingMs)}`}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={togglePlay}
            disabled={!ready}
            aria-label={playing ? 'Pause' : 'Play'}
            className="relative flex h-[58px] w-[58px] flex-shrink-0 items-center justify-center rounded-full transition-[transform,opacity] active:scale-[0.97] disabled:opacity-40"
          >
            <svg className="absolute inset-0" width="58" height="58" viewBox="0 0 58 58" aria-hidden="true">
              <circle cx="29" cy="29" r="27" fill="none" stroke="var(--line)" strokeWidth="1.4" />
            </svg>
            {playing ? (
              <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
                <rect x="3" y="2" width="4" height="14" rx="1" fill="var(--fg)" />
                <rect x="11" y="2" width="4" height="14" rx="1" fill="var(--fg)" />
              </svg>
            ) : (
              <svg width="14" height="16" viewBox="0 0 18 18" fill="var(--fg)" className="ml-[2px]" aria-hidden="true">
                <path d="M4 2 L16 9 L4 16 Z" />
              </svg>
            )}
          </button>

          <div className="flex w-[72px] flex-col items-center gap-[9px]">
            <span className="sc-eyebrow--muted whitespace-nowrap text-[10px]">Night Shade</span>
            <button
              type="button"
              onClick={() => setNightShade(true)}
              aria-label="Night Shade"
              className="relative flex h-10 w-10 items-center justify-center rounded-full"
            >
              <svg className="absolute inset-0" width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
                <circle cx="20" cy="20" r="18" fill="none" stroke="var(--line)" strokeWidth="1.2" />
              </svg>
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="var(--fg-faint)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14.2 11.8A6 6 0 1 1 8.2 5.8a4.7 4.7 0 0 0 6 6Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} label="Session length">
        <div className="text-center">
          <div className="sc-eyebrow--muted">Session Length</div>
          <div className="mt-2 font-mono text-[26px] text-fg">
            {Math.floor(draftMinutes / 60)}h {String(draftMinutes % 60).padStart(2, '0')}m
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-[9px]">
          {presets.map((minutes) => (
            <button
              key={minutes}
              type="button"
              onClick={() => setDraftMinutes(minutes)}
              className={`sc-chip ${draftMinutes === minutes ? 'is-selected' : ''}`}
            >
              {formatDuration(minutes)}
            </button>
          ))}
        </div>
        <button type="button" className="sc-cta-filled" onClick={() => applyTimer(draftMinutes)}>
          Set
        </button>
        {prefs.timerMinutes !== null && (
          <button type="button" onClick={() => applyTimer(null)} className="sc-textbtn sc-textbtn--muted -mt-2 self-center">
            No timer
          </button>
        )}
      </Sheet>
    </main>
  );
}

function formatClock(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function PlayerMessage({ text }: { text: string }) {
  return (
    <main className="sc-frame items-center justify-center">
      <p className="sc-eyebrow--muted">{text}</p>
    </main>
  );
}

// Three slow-orbiting gradient blobs inside the dial, with the elapsed share of the session
// timer drawn as an arc. Blob motion pauses with playback.
function Orb({ progress, playing }: { progress: number; playing: boolean }) {
  const blobs = [
    { id: 'blob1', color: 'var(--blob-1)', peak: 0.5, mid: 0.15, cx: 88, cy: 96, className: 'pl-core1' },
    { id: 'blob2', color: 'var(--blob-2)', peak: 0.55, mid: 0.17, cx: 134, cy: 100, className: 'pl-core2' },
    { id: 'blob3', color: 'var(--blob-3)', peak: 0.5, mid: 0.16, cx: 108, cy: 138, className: 'pl-core3' },
  ];
  return (
    <div className={`relative flex h-[188px] w-[188px] items-center justify-center ${playing ? '' : 'pl-orb-paused'}`}>
      <svg width="188" height="188" viewBox="0 0 220 220" aria-hidden="true">
        <defs>
          <clipPath id="dialClip"><circle cx="110" cy="110" r="86" /></clipPath>
          {blobs.map((blob) => (
            <radialGradient key={blob.id} id={blob.id} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={blob.color} stopOpacity={blob.peak} />
              <stop offset="60%" stopColor={blob.color} stopOpacity={blob.mid} />
              <stop offset="100%" stopColor={blob.color} stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>
        <g clipPath="url(#dialClip)">
          <circle cx="110" cy="110" r="86" fill="var(--bg)" />
          {blobs.map((blob) => (
            <g key={blob.id} className={blob.className}>
              <circle cx={blob.cx} cy={blob.cy} r="95" fill={`url(#${blob.id})`} />
            </g>
          ))}
        </g>
        <circle cx="110" cy="110" r="86" fill="none" stroke="var(--fg-faint)" strokeWidth="1.6" opacity="0.55" />
        {progress > 0 && (
          <circle
            cx="110"
            cy="110"
            r="86"
            fill="none"
            stroke="var(--signal)"
            strokeWidth="2.4"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${progress} 100`}
            transform="rotate(-90 110 110)"
          />
        )}
      </svg>
    </div>
  );
}

function VoiceIcon() {
  const rings = [
    { r: 40, width: 2.6, opacity: 0.22 },
    { r: 32, width: 2.6, opacity: 0.32 },
    { r: 25, width: 2.6, opacity: 0.45 },
    { r: 18, width: 2.8, opacity: 0.6 },
    { r: 11, width: 3, opacity: 0.78 },
  ];
  return (
    <svg width="34" height="39" viewBox="-3 -3 106 122" fill="none" stroke="var(--signal)" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <defs>
        <clipPath id="headClipVoice"><path d={HEAD_PATH} /></clipPath>
      </defs>
      <path d={HEAD_PATH} strokeWidth="3.6" />
      <g clipPath="url(#headClipVoice)">
        {rings.map((ring) => (
          <circle key={ring.r} cx="50" cy="38" r={ring.r} strokeWidth={ring.width} opacity={ring.opacity} />
        ))}
        <circle cx="50" cy="38" r="3.2" fill="var(--signal)" stroke="none" />
      </g>
    </svg>
  );
}

// Thin rail with a --signal fill and ring thumb. Drag anywhere on the track, or use arrow keys.
function HairlineSlider({
  label,
  value,
  min,
  max,
  step,
  disabled = false,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const span = max - min;
  const pct = span > 0 ? ((value - min) / span) * 100 : 0;

  const setFromClientX = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || span <= 0) return;
    const rel = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    onChange(min + rel * span);
  };

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      aria-disabled={disabled}
      className={`relative flex h-[22px] flex-1 cursor-pointer touch-none items-center outline-none ${disabled ? 'pointer-events-none opacity-50' : ''}`}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setFromClientX(e.clientX);
      }}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) setFromClientX(e.clientX);
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') onChange(Math.max(min, Math.round(value) - step));
        else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') onChange(Math.min(max, Math.round(value) + step));
        else return;
        e.preventDefault();
      }}
    >
      <div className="absolute inset-x-0 h-[2px] rounded-[1px] bg-line opacity-45" />
      <div className="absolute left-0 h-[2px] rounded-[1px] bg-signal" style={{ width: `${pct}%` }} />
      <div
        className="absolute h-[14px] w-[14px] -translate-x-1/2 rounded-full border-2 border-signal bg-bg"
        style={{ left: `${pct}%` }}
      />
    </div>
  );
}
