'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  VOICES,
  findSession,
  findVoice,
  needsMembership,
  playerHref,
  saveLastPlayed,
  sessionLabel,
  sessionSubtitle,
  type Session,
} from '@/lib/catalog';
import { useMembership } from '@/hooks/useMembership';
import { fetchBackgroundMedia, fetchSessionMedia, RequestError } from '@/lib/authedFetch';
import { buildPlayPlan, buildScript, type ScriptConcept, type SessionManifest } from '@/lib/audio/playPlan';
import { PulseWidthPreview } from '@/lib/audio/PulseWidthPreview';
import { SessionEngine } from '@/lib/audio/SessionEngine';
import { StayAwake } from '@/lib/audio/StayAwake';
import { MediaSessionController } from '@/lib/audio/MediaSessionController';
import {
  backgroundMixLabel,
  backgroundStatusLabel,
  findMusic,
  findNature,
  s3PathFor,
  type BackgroundSelection,
} from '@/lib/backgrounds';
import {
  DEFAULT_PREFS,
  LENGTH_HOURS,
  LENGTH_MINUTES,
  effectiveStatements,
  formatLengthCountdown,
  formatLengthIdle,
  formatPlaybackClock,
  loadPlayerPrefs,
  prefsPulseWidth,
  savePlayerPrefs,
  type PlayerPrefs,
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
import MixFader from '@/components/ui/MixFader';
import PlayerCtas from '@/components/ui/PlayerCtas';
import PlayerSettingsSheet from '@/components/ui/PlayerSettingsSheet';
import Rings, { PLAYER_BALL_PERCENT, PLAYER_RING_SIZES } from '@/components/ui/Rings';
import Sheet, { SheetHeader } from '@/components/ui/Sheet';
import PlayerIntro from '@/components/ui/PlayerIntro';
import StatementsOverlay from '@/components/ui/StatementsOverlay';
import SaveSettingsPrompt from '@/components/ui/SaveSettingsPrompt';
import VoicePicker from '@/components/ui/VoicePicker';
import WheelPicker from '@/components/ui/WheelPicker';
import { MoonIcon, PauseIcon, PlayIcon, StatementsIcon } from '@/components/ui/icons';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const LAST_PLAYED_AFTER_SEC = 60;
const LISTEN_NIGHT_AFTER_SEC = 180;
const FADE_OUT_SECONDS = 8;
const DEFAULT_LENGTH_MINUTES = 120;
const LENGTH_PRESETS_MIN = [30, 60, 120, 240, 480] as const;
const CHROME_IDLE_MS = 10_000;

type PlayerPanel = 'length' | 'custom' | 'settings' | 'narrator' | null;

type LoadState =
  | { kind: 'loading'; loaded: number; total: number }
  | { kind: 'ready' }
  | { kind: 'error'; message: string };

export default function PlayerPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { isMember, loading: membershipLoading } = useMembership();
  const { currentUser } = useAuth();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const found = findSession(decodeURIComponent(params?.id ?? ''));
    if (!found) {
      router.replace('/library');
      return;
    }
    setSession(found);
  }, [router, params?.id]);

  // Every full session needs an account; the free one needs only a free sign-up.
  useEffect(() => {
    if (!session || currentUser) return;
    router.replace(`/login?mode=signup&next=${encodeURIComponent(`/play/${session.id}`)}`);
  }, [session, currentUser, router]);

  useEffect(() => {
    if (!session || !currentUser || membershipLoading) return;
    if (needsMembership(session) && !isMember) {
      router.replace('/pricing');
    }
  }, [session, currentUser, membershipLoading, isMember, router]);

  if (!session || !currentUser || (needsMembership(session) && (membershipLoading || !isMember))) {
    return <PlayerMessage text={'Loading\u2026'} />;
  }
  return <Player session={session} />;
}

const SITE_THEME_COLOR = '#10131a';

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
  useDocumentTitle(sessionLabel(session));
  const engineRef = useRef<SessionEngine | null>(null);
  const wakeRef = useRef<StayAwake | null>(null);
  const mediaRef = useRef<MediaSessionController | null>(null);
  const pulsePreviewRef = useRef<PulseWidthPreview | null>(null);
  const pulseUrlRef = useRef<string | null>(null);
  const [load, setLoad] = useState<LoadState>({ kind: 'loading', loaded: 0, total: 0 });
  const [attempt, setAttempt] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [prefs, setPrefs] = useState<PlayerPrefs>(DEFAULT_PREFS);
  // Session length in seconds; 0 = plays until you stop.
  const [lengthSec, setLengthSec] = useState(0);
  const [remainingSec, setRemainingSec] = useState(0);
  const [ending, setEnding] = useState(false);
  const [panel, setPanel] = useState<PlayerPanel>(null);
  const [draftH, setDraftH] = useState(2);
  const [draftM, setDraftM] = useState(0);
  const [decodingId, setDecodingId] = useState<string | null>(null);
  const [shadeOn, setShadeOn] = useState(false);
  const [introOpen, setIntroOpen] = useState(false);
  const [statementsOpen, setStatementsOpen] = useState(false);
  const [script, setScript] = useState<ScriptConcept[]>([]);
  /** Loaded affirmation clips (variants), not concept count — drives Statements max. */
  const [clipCount, setClipCount] = useState(0);
  const [promptPending, setPromptPending] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [historyKey, setHistoryKey] = useState(0);
  const [beatSec, setBeatSec] = useState(1);
  const [chromeVisible, setChromeVisible] = useState(true);
  const wasEnding = useRef(false);
  const listenedEnough = useRef(false);
  const lastPlayedSaved = useRef(false);
  const nightRecorded = useRef(false);
  const listenAccum = useRef(0);
  const sessionEndedCleanly = useRef(false);
  const promptOpenRef = useRef(false);
  const pendingVoiceNoticeRef = useRef<string | null>(null);
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
    const media = new MediaSessionController();
    const pulsePreview = new PulseWidthPreview();
    engine.onPlayingChange = setPlaying;
    engineRef.current = engine;
    wakeRef.current = wake;
    mediaRef.current = media;
    pulsePreviewRef.current = pulsePreview;

    media.setHandlers({
      play: async () => {
        const current = engineRef.current;
        if (!current?.ready || current.playing) return;
        pulsePreviewRef.current?.stop();
        wakeRef.current?.enable();
        await current.play();
      },
      pause: async () => {
        const current = engineRef.current;
        if (!current?.ready || !current.playing) return;
        await current.pause();
      },
    });

    const saved = loadPlayerPrefs();
    if (saved.voiceId) savePlayerPrefs(saved);
    setPrefs(saved);
    setLengthSec(DEFAULT_LENGTH_MINUTES * 60);
    setRemainingSec(DEFAULT_LENGTH_MINUTES * 60);
    engine.setVoiceMix(saved.voiceMix);
    engine.setVolume(0.8);
    engine.setRepeat(saved.repeat);
    engine.setSpacing(true);
    engine.setPulseWidth(prefsPulseWidth(saved));
    if (saved.background.group === 'pulse') engine.usePulseBackground();
    pulsePreview.setPrefsVolume(80, saved.voiceMix);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') engine.resumeIfPlaying();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      engine.dispose();
      wake.dispose();
      media.dispose();
      pulsePreview.dispose();
      engineRef.current = null;
      wakeRef.current = null;
      mediaRef.current = null;
      pulsePreviewRef.current = null;
    };
  }, []);

  useEffect(() => {
    mediaRef.current?.setMetadata({
      title: sessionLabel(session),
      artist: 'SleepCode',
      album: backgroundMixLabel(prefs.background).name,
      artworkPath: '/og.jpg',
    });
  }, [session, prefs.background]);

  useEffect(() => {
    mediaRef.current?.setPlaying(playing);
  }, [playing]);

  useEffect(() => {
    const engine = engineRef.current;
    const voiceId = prefs.voiceId;
    if (!engine || !voiceId) return;
    let cancelled = false;
    setLoad({ kind: 'loading', loaded: 0, total: 0 });
    setClipCount(0);
    const pendingNotice = pendingVoiceNoticeRef.current;
    pendingVoiceNoticeRef.current = null;
    setVoiceNotice(pendingNotice);

    async function loadWithVoice(id: string) {
      const signed = await fetchSessionMedia(session.id, id);
      const fileUrl = (name: string) => `${signed.baseUrl}${encodeURIComponent(name)}?${signed.query}`;
      const response = await fetch(fileUrl('manifest.json'));
      if (!response.ok) throw new Error('This session\u2019s audio isn\u2019t available yet.');
      const manifest = (await response.json()) as SessionManifest;
      const plan = buildPlayPlan(manifest, fileUrl);
      if (!plan.statementUrls.length) throw new Error('This session\u2019s audio isn\u2019t available yet.');
      if (cancelled) return;
      setScript(buildScript(manifest));
      pulseUrlRef.current = plan.pulseUrl;
      await engine!.load(plan, (loaded, total) => {
        if (!cancelled) setLoad({ kind: 'loading', loaded, total });
      });
      if (!cancelled) setClipCount(engine!.clipCount);
    }

    function friendlyLoadError(error: unknown): string {
      const raw = error instanceof Error ? error.message : '';
      if (/failed to fetch|networkerror|load failed/i.test(raw)) {
        return 'This session couldn\u2019t load. Please try again.';
      }
      return raw || 'This session couldn\u2019t load. Please try again.';
    }

    (async () => {
      try {
        await loadWithVoice(voiceId);
        if (cancelled) return;
        setBeatSec(engine!.pulseBeatSeconds ?? 1);
        const savedPrefs = loadPlayerPrefs();
        engine!.setStatementLimit(effectiveStatements(savedPrefs, engine!.clipCount));
        const bg = savedPrefs.background;
        if (bg.group !== 'pulse') {
          // Fire-and-forget restore of Nature/Music after session clips load.
          void (async () => {
            try {
              const item = bg.group === 'nature' ? findNature(bg.id) : findMusic(bg.id);
              const path = s3PathFor(bg);
              if (!item || !path) return;
              const signed = await fetchBackgroundMedia();
              const relative = path.replace(/^background\//, '');
              const url = `${signed.baseUrl}${relative}?${signed.query}`;
              const res = await fetch(url);
              if (!res.ok) return;
              const actx = new (window.AudioContext ||
                (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
              const buffer = await actx.decodeAudioData(await res.arrayBuffer());
              await actx.close().catch(() => {});
              if (cancelled) return;
              const bpm = bg.group === 'music' && 'bpm' in item ? Number(item.bpm) : undefined;
              engine!.setBackgroundBuffer(buffer, { bpm });
            } catch {
              // Stay on pulse.
            }
          })();
        } else {
          engine!.usePulseBackground();
          engine!.setPulseWidth(bg.width);
        }
        setLoad({ kind: 'ready' });
      } catch (error) {
        if (cancelled) return;
        if (error instanceof RequestError && error.status === 403) {
          router.replace('/library');
          return;
        }

        const fallback = VOICES.find((voice) => voice.id !== voiceId) ?? null;
        if (fallback) {
          try {
            await loadWithVoice(fallback.id);
            if (cancelled) return;
            setBeatSec(engine!.pulseBeatSeconds ?? 1);
            const next = { ...loadPlayerPrefs(), voiceId: fallback.id };
            engine!.setStatementLimit(effectiveStatements(next, engine!.clipCount));
            const failedName = findVoice(voiceId)?.name ?? 'that';
            pendingVoiceNoticeRef.current =
              `This session isn\u2019t ready in ${failedName}\u2019s voice yet. Playing ${fallback.name} instead.`;
            savePlayerPrefs(next);
            setPrefs(next);
            setLoad({ kind: 'ready' });
            return;
          } catch (fallbackError) {
            if (cancelled) return;
            if (fallbackError instanceof RequestError && fallbackError.status === 403) {
              router.replace('/library');
              return;
            }
            setLoad({ kind: 'error', message: friendlyLoadError(fallbackError) });
            return;
          }
        }

        setLoad({ kind: 'error', message: friendlyLoadError(error) });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session, attempt, router, prefs.voiceId]);

  function chooseVoice(voiceId: string) {
    pendingVoiceNoticeRef.current = null;
    setVoiceNotice(null);
    const next = { ...loadPlayerPrefs(), voiceId };
    savePlayerPrefs(next);
    setPrefs(next);
  }

  // Reset session clocks when switching sessions.
  useEffect(() => {
    listenAccum.current = 0;
    listenedEnough.current = false;
    lastPlayedSaved.current = false;
    nightRecorded.current = false;
    sessionEndedCleanly.current = false;
  }, [session.id]);

  // Count real listening time: last-played after 1 minute; night after 3 minutes; elapsed display.
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
  }, [currentUser, promptPending, shadeOn, playing, introOpen, panel, statementsOpen]);

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

  // After 10s idle while playing, turn on Night shade (screen goes black, audio keeps
  // playing). Any press/drag/scroll/key holds or resets the timer; the countdown only
  // runs once every pointer is up. Open sheets and overlays hold it off.
  const chromeBlocked =
    !playing ||
    shadeOn ||
    statementsOpen ||
    introOpen ||
    promptOpen ||
    panel !== null;

  useEffect(() => {
    if (chromeBlocked) {
      setChromeVisible(true);
      return;
    }

    let timer: ReturnType<typeof setTimeout> | null = null;
    const activePointers = new Set<number>();

    const clearTimer = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    const armTimer = () => {
      clearTimer();
      setChromeVisible(true);
      timer = setTimeout(() => setShadeOn(true), CHROME_IDLE_MS);
    };

    const onPointerDown = (event: PointerEvent) => {
      activePointers.add(event.pointerId);
      clearTimer();
      setChromeVisible(true);
    };

    const onPointerUp = (event: PointerEvent) => {
      activePointers.delete(event.pointerId);
      if (activePointers.size === 0) armTimer();
    };

    // Hover alone must not reset; only count move while a press/drag is held.
    const onPointerMove = () => {
      if (activePointers.size === 0) return;
      clearTimer();
      setChromeVisible(true);
    };

    const onDiscreteActivity = () => {
      if (activePointers.size > 0) {
        clearTimer();
        setChromeVisible(true);
        return;
      }
      armTimer();
    };

    armTimer();
    window.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('pointerup', onPointerUp, true);
    window.addEventListener('pointercancel', onPointerUp, true);
    window.addEventListener('pointermove', onPointerMove, true);
    window.addEventListener('wheel', onDiscreteActivity, { capture: true, passive: true });
    window.addEventListener('keydown', onDiscreteActivity, true);

    return () => {
      clearTimer();
      window.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('pointerup', onPointerUp, true);
      window.removeEventListener('pointercancel', onPointerUp, true);
      window.removeEventListener('pointermove', onPointerMove, true);
      window.removeEventListener('wheel', onDiscreteActivity, true);
      window.removeEventListener('keydown', onDiscreteActivity, true);
    };
  }, [chromeBlocked]);

  const chromeStyle = {
    opacity: chromeVisible ? 1 : 0,
    pointerEvents: chromeVisible ? ('auto' as const) : ('none' as const),
    transition: 'opacity 0.6s ease',
  };

  const updatePrefs = (patch: Partial<PlayerPrefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    savePlayerPrefs(next);
    if (typeof patch.repeat === 'number') engineRef.current?.setRepeat(patch.repeat);
    if (typeof patch.voiceMix === 'number') engineRef.current?.setVoiceMix(patch.voiceMix);
    if (patch.statements !== undefined) {
      const engine = engineRef.current;
      const max = engine?.clipCount || clipCount || 1;
      engine?.setStatementLimit(effectiveStatements({ ...prefs, ...patch }, max));
    }
  };

  const setVoiceMix = (voiceMix: number) => {
    engineRef.current?.setVoiceMix(voiceMix);
    updatePrefs({ voiceMix });
  };

  async function selectBackground(selection: BackgroundSelection) {
    const engine = engineRef.current;
    if (!engine) {
      updatePrefs({ background: selection });
      return;
    }
    if (selection.group === 'pulse') {
      engine.usePulseBackground();
      engine.setPulseWidth(selection.width);
      updatePrefs({ background: selection });
      // One-shot stereo preview while idle; live session already hears setPulseWidth.
      // Rapid picks cancel the previous shot and restart with the new width.
      const url = pulseUrlRef.current;
      if (url && !engine.playing) {
        void pulsePreviewRef.current?.playOnce(url, selection.width).catch(() => {});
      }
      return;
    }
    pulsePreviewRef.current?.stop();
    const item = selection.group === 'nature' ? findNature(selection.id) : findMusic(selection.id);
    const path = s3PathFor(selection);
    if (!item || !path) return;
    setDecodingId(selection.id);
    try {
      const signed = await fetchBackgroundMedia();
      const relative = path.replace(/^background\//, '');
      const url = `${signed.baseUrl}${relative}?${signed.query}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Background request failed');
      const ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const buffer = await ctx.decodeAudioData(await response.arrayBuffer());
      await ctx.close().catch(() => {});
      const bpm = selection.group === 'music' && 'bpm' in item ? Number(item.bpm) : undefined;
      engine.setBackgroundBuffer(buffer, { bpm });
      updatePrefs({ background: selection });
    } catch {
      // Keep previous background.
    } finally {
      setDecodingId(null);
    }
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
    setPanel(null);
  };

  const openLength = () => setPanel('length');

  const openCustomLength = () => {
    let minutes = DEFAULT_LENGTH_MINUTES;
    if (lengthSec > 0) minutes = Math.round(lengthSec / 60);
    const hours = Math.min(10, Math.floor(minutes / 60));
    setDraftH(hours);
    setDraftM(Math.min(50, Math.round((minutes % 60) / 10) * 10));
    setPanel('custom');
  };

  function stopsAroundLabel(sec: number): string {
    const end = new Date(Date.now() + sec * 1000);
    return end.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }

  const togglePlay = async () => {
    const engine = engineRef.current;
    if (!engine?.ready) return;
    if (engine.playing) {
      await engine.pause();
      return;
    }
    pulsePreviewRef.current?.stop();
    wakeRef.current?.enable();
    await engine.play();
  };

  const ready = load.kind === 'ready';
  const hasLength = lengthSec > 0;
  const draftMinutes = draftH * 60 + draftM;
  const lengthStarted = hasLength && remainingSec > 0 && remainingSec < lengthSec && playing;
  const lengthLabel = !hasLength
    ? 'Length'
    : lengthStarted
      ? formatLengthCountdown(remainingSec)
      : formatLengthIdle(lengthSec);
  const closePanel = () => {
    pulsePreviewRef.current?.stop();
    setPanel(null);
  };
  const voiceName = findVoice(prefs.voiceId)?.name ?? VOICES[0]?.name ?? 'Owen';
  const mixLabel = backgroundMixLabel(prefs.background);
  const statusLine = backgroundStatusLabel(prefs.background, voiceName);

  let status: ReactNode = null;
  if (load.kind === 'loading') {
    status = 'Preparing session\u2026';
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
  } else if (voiceNotice) {
    status = voiceNotice;
  }


  return (
    <main
      className="relative flex min-h-screen min-h-[100dvh] flex-col overflow-hidden text-p-fg"
      style={{ background: playing ? 'var(--p-bg-playing)' : 'var(--p-bg)', transition: 'background 2.6s ease' }}
    >
      {/* Soft ambient blob — exploratory; behind chrome/rings only. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <div
          className="absolute left-1/2 top-[16%] h-[min(72vw,440px)] w-[min(72vw,440px)] -translate-x-1/2 rounded-full opacity-[0.1]"
          style={{
            background:
              'radial-gradient(circle at 42% 38%, color-mix(in srgb, var(--p-accent) 58%, white) 0%, var(--p-accent) 42%, transparent 70%)',
            filter: 'blur(52px)',
          }}
        />
        <div
          className="absolute left-[12%] top-[48%] h-[min(44vw,280px)] w-[min(44vw,280px)] rounded-full opacity-[0.1]"
          style={{
            background:
              'radial-gradient(circle, color-mix(in srgb, var(--p-accent) 45%, transparent) 0%, transparent 72%)',
            filter: 'blur(60px)',
          }}
        />
      </div>
      <div
        className="relative z-10 flex items-center justify-between gap-3 px-[clamp(22px,4vw,48px)] pb-3 pt-[calc(12px+env(safe-area-inset-top,0px))] text-[15px] text-p-muted [@media(min-height:760px)]:pb-2 [@media(min-height:760px)]:pt-[calc(8px+env(safe-area-inset-top,0px))]"
        style={chromeStyle}
        aria-hidden={!chromeVisible}
      >
        <Link href="/library" className="flex min-h-[44px] items-center">&lsaquo; Back</Link>
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
            aria-label="Listening tips"
            title="Listening tips"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-full border border-p-chip-border px-3 text-[14px] font-medium text-p-fg sm:px-4"
          >
            <span aria-hidden="true" className="font-mono text-[15px] leading-none">?</span>
            <span className="hidden sm:inline">Tips</span>
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

      <div className="relative z-10 mx-auto box-border flex w-full max-w-[520px] flex-1 flex-col items-center px-[clamp(22px,4vw,48px)] pb-[calc(16px+env(safe-area-inset-bottom,0px))]">
        <div
          className="flex w-full flex-1 flex-col items-center"
          onClick={panel ? () => setPanel(null) : undefined}
        >
          <div className="flex w-full flex-col items-center gap-5 pt-1">
            {/* Height-capped so larger rings don’t shove tiles off short screens. */}
            <div style={{ width: 'min(72vw, 42dvh, 300px)' }}>
              <Rings
                color="var(--p-accent)"
                glowing={playing}
                restOpacity={0.26}
                beatSec={beatSec}
                sizes={PLAYER_RING_SIZES}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    void togglePlay();
                  }}
                  disabled={!ready}
                  aria-label={playing ? 'Pause' : 'Play'}
                  className="absolute inset-0 grid place-items-center rounded-full disabled:opacity-40"
                >
                  <span
                    className="grid place-items-center rounded-full bg-p-accent text-p-on-accent"
                    style={{ width: `${PLAYER_BALL_PERCENT}%`, height: `${PLAYER_BALL_PERCENT}%` }}
                  >
                    {playing ? (
                      <PauseIcon size={18} />
                    ) : (
                      <PlayIcon size={18} className="translate-x-[2px]" />
                    )}
                  </span>
                </button>
              </Rings>
            </div>

            <div className="flex flex-col items-center gap-2">
              <h1 className="text-center text-[clamp(24px,2.8vw,30px)] font-medium tracking-[-0.02em]">
                {sessionLabel(session)}
              </h1>
              <p className="text-center text-[14px] text-p-muted">{statusLine}</p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <ListenHistory refreshKey={historyKey} />
              <p className="min-h-[20px] text-center text-[14px] text-p-muted" role="status">
                {status}
              </p>
            </div>
          </div>

          <div className="flex-1" />
        </div>

        <div
          className="flex w-full flex-col gap-5"
          style={chromeStyle}
          aria-hidden={!chromeVisible}
          onClick={(e) => e.stopPropagation()}
        >
          <PlayerIntro open={introOpen} onClose={() => setIntroOpen(false)} />
          <MixFader
            voiceMix={prefs.voiceMix}
            backgroundName={mixLabel.name}
            backgroundGroup={mixLabel.group}
            onChange={setVoiceMix}
          />
          <PlayerCtas
            onSettings={() => setPanel('settings')}
            onLength={openLength}
            lengthLabel={lengthLabel}
            lengthActive={hasLength}
          />
        </div>
      </div>

      <Sheet open={panel === 'length'} onClose={closePanel} label="Length" tone="player">
        <SheetHeader title="Length" onCancel={closePanel} tone="player" actionLabel="Done" />
        <p className="-mt-2 text-center text-[13px] text-p-muted">
          Stops around <span className="font-mono">{stopsAroundLabel(lengthSec > 0 ? lengthSec : DEFAULT_LENGTH_MINUTES * 60)}</span>
        </p>
        <div className="overflow-hidden rounded-[14px] border border-hairline bg-p-panel">
          {LENGTH_PRESETS_MIN.map((minutes) => {
            const selected = lengthSec === minutes * 60;
            return (
              <button
                key={minutes}
                type="button"
                onClick={() => applyLength(minutes)}
                className={`flex w-full items-center justify-between border-t border-hairline px-4 py-3.5 text-left text-[15px] first:border-t-0 ${
                  selected ? 'bg-[var(--selected-bg)]' : ''
                }`}
              >
                <span>
                  {minutes < 60 ? `${minutes} minutes` : minutes === 60 ? '1 hour' : `${minutes / 60} hours`}
                </span>
                {selected ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-p-accent" aria-hidden="true">
                    <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : null}
              </button>
            );
          })}
          <button
            type="button"
            onClick={openCustomLength}
            className="flex w-full items-center justify-between border-t border-hairline px-4 py-3.5 text-left text-[15px]"
          >
            <span>Custom</span>
            <span className="text-[14px] text-p-muted">up to 10 hr ›</span>
          </button>
        </div>
        <p className="text-[12.5px] leading-snug text-p-muted">
          Voice and background stop together when the time is up, with a short fade.
        </p>
      </Sheet>

      <Sheet open={panel === 'custom'} onClose={() => setPanel('length')} label="Custom length" tone="player">
        <SheetHeader title="Custom" onCancel={() => setPanel('length')} tone="player" actionLabel="Back" />
        <div className="flex gap-3">
          <WheelPicker
            options={LENGTH_HOURS}
            value={draftH}
            onChange={setDraftH}
            format={(h) => String(h)}
            label="Hours"
            unit="hr"
          />
          <WheelPicker
            options={LENGTH_MINUTES}
            value={draftM}
            onChange={setDraftM}
            format={(m) => String(m).padStart(2, '0')}
            label="Minutes"
            unit="min"
          />
        </div>
        <p className="-mt-2 min-h-[20px] text-center text-[13px] text-p-muted">
          {draftMinutes === 0
            ? 'Choose a length up to 10 hours'
            : `Stops around ${stopsAroundLabel(draftMinutes * 60)}`}
        </p>
        <div className="flex justify-end pt-1">
          <button
            type="button"
            disabled={draftMinutes === 0 || draftMinutes > 600}
            onClick={() => applyLength(Math.min(600, draftMinutes))}
            className="min-h-[48px] rounded-full bg-p-accent px-[26px] text-[15px] font-semibold text-p-on-accent disabled:opacity-40"
          >
            Set length
          </button>
        </div>
      </Sheet>

      <PlayerSettingsSheet
        open={panel === 'settings'}
        onClose={closePanel}
        prefs={prefs}
        onChange={updatePrefs}
        onSelectBackground={selectBackground}
        onStopPulsePreview={() => pulsePreviewRef.current?.stop()}
        decodingId={decodingId}
        statementMax={Math.max(1, clipCount)}
      />


      <Sheet open={panel === 'narrator'} onClose={closePanel} label="Narrator" tone="player">
        <SheetHeader title="Narrator" onCancel={closePanel} tone="player" actionLabel="Done" />
        <VoicePicker voices={VOICES} selectedId={prefs.voiceId} onSelect={chooseVoice} tone="player" />
        <p className="text-[13px] leading-snug text-p-muted">
          Applies to every session. It&rsquo;s saved in Account with your other listening settings.
        </p>
      </Sheet>

      <StatementsOverlay
        open={statementsOpen && !shadeOn}
        onClose={() => setStatementsOpen(false)}
        title={session.title}
        subtitle={sessionSubtitle(session)}
        concepts={script}
      />
      <SaveSettingsPrompt
        open={promptOpen && !shadeOn && !introOpen && !statementsOpen && panel === null}
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

function ChipRow({
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
    <div className="grid grid-cols-3 gap-[6px]" role="radiogroup" aria-label={label}>
      {options.map((option) => {
        const selected = option === value;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option)}
            className={`min-h-[52px] rounded-[12px] border text-[15px] ${
              selected
                ? 'sc-sel font-semibold'
                : 'border-[rgba(231,225,214,0.16)] text-p-fg'
            }`}
          >
            {format(option)}
          </button>
        );
      })}
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
