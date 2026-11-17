# Media Session Play/Pause Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expose SleepCode player playback to the OS media UI with session title/artwork and play/pause only, without changing `SessionEngine` or adding seek/skip.

**Architecture:** A thin `MediaSessionController` wraps `navigator.mediaSession` (metadata, `playbackState`, play/pause handlers). The player page creates one instance, feeds it `sessionLabel` metadata, syncs playing state from the engine, and routes OS play/pause into the same path as the on-screen button (including `StayAwake.enable()` on play).

**Tech Stack:** Next.js App Router, TypeScript, Media Session API, existing `SessionEngine` + player page.

**Spec:** `docs/superpowers/specs/2026-11-17-media-session-design.md`

## Global Constraints

- Play / pause handlers only — never register seek or track-skip actions
- Web Audio (`SessionEngine`) remains the only audio engine — no silent `<audio>` bridge
- `StayAwake` behavior unchanged
- Metadata: `title` = `sessionLabel(session)`, `artist` = `SleepCode`, `album` = `session.theme`, artwork = `/og.jpg`
- Guard with `'mediaSession' in navigator`; no-op on unsupported browsers
- This package has **no unit-test runner** — verify with `npx tsc --noEmit` and the device checklist in the spec

## File map

| File | Role |
|------|------|
| `src/lib/audio/MediaSessionController.ts` | Metadata, playbackState, play/pause handlers, dispose |
| `src/app/application/player/page.tsx` | Create controller, set metadata, sync playing, wire handlers |

---

### Task 1: MediaSessionController

**Files:**
- Create: `src/lib/audio/MediaSessionController.ts`

**Interfaces:**
- Produces:
  - `MediaSessionMeta` — `{ title: string; artist: string; album: string; artworkPath: string }`
  - `MediaSessionController` with:
    - `setHandlers(handlers: { play: () => void | Promise<void>; pause: () => void | Promise<void> }): void`
    - `setMetadata(meta: MediaSessionMeta): void`
    - `setPlaying(playing: boolean): void`
    - `dispose(): void`

- [ ] **Step 1: Create `src/lib/audio/MediaSessionController.ts`**

```ts
export type MediaSessionMeta = {
  title: string;
  artist: string;
  album: string;
  /** Site path, e.g. `/og.jpg` — resolved against `window.location.origin`. */
  artworkPath: string;
};

function supported(): boolean {
  return typeof navigator !== 'undefined' && 'mediaSession' in navigator;
}

function artworkFor(path: string): MediaImage[] {
  const src = new URL(path, window.location.origin).href;
  return [
    { src, sizes: '256x256', type: 'image/jpeg' },
    { src, sizes: '512x512', type: 'image/jpeg' },
  ];
}

export class MediaSessionController {
  private playHandler: (() => void | Promise<void>) | null = null;
  private pauseHandler: (() => void | Promise<void>) | null = null;

  setHandlers(handlers: {
    play: () => void | Promise<void>;
    pause: () => void | Promise<void>;
  }): void {
    if (!supported()) return;
    this.playHandler = handlers.play;
    this.pauseHandler = handlers.pause;
    try {
      navigator.mediaSession.setActionHandler('play', () => {
        void this.playHandler?.();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        void this.pauseHandler?.();
      });
    } catch {
      // Some browsers reject unknown or duplicate handlers.
    }
  }

  setMetadata(meta: MediaSessionMeta): void {
    if (!supported()) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: meta.title,
        artist: meta.artist,
        album: meta.album,
        artwork: artworkFor(meta.artworkPath),
      });
    } catch {
      // MediaMetadata unsupported or artwork rejected.
    }
  }

  setPlaying(playing: boolean): void {
    if (!supported()) return;
    try {
      navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
    } catch {
      // playbackState not writable in some environments.
    }
  }

  dispose(): void {
    if (!supported()) return;
    this.playHandler = null;
    this.pauseHandler = null;
    try {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
    } catch {
      // ignore
    }
    try {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = 'none';
    } catch {
      // ignore
    }
  }
}
```

- [ ] **Step 2: Typecheck the new file**

Run: `cd membership-site && npx tsc --noEmit`
Expected: PASS (no errors)

- [ ] **Step 3: Commit**

```bash
git add membership-site/src/lib/audio/MediaSessionController.ts
git commit -m "$(cat <<'EOF'
Add MediaSessionController for lock-screen play/pause.

EOF
)"
```

---

### Task 2: Wire controller into the player

**Files:**
- Modify: `src/app/application/player/page.tsx`

**Interfaces:**
- Consumes: `MediaSessionController`, `MediaSessionMeta` from Task 1; existing `sessionLabel`, `togglePlay` / engine + wake refs

- [ ] **Step 1: Import and hold a ref**

Near the other audio imports:

```ts
import { MediaSessionController } from '@/lib/audio/MediaSessionController';
```

Inside `Player`, next to `wakeRef`:

```ts
const mediaRef = useRef<MediaSessionController | null>(null);
```

- [ ] **Step 2: Construct and dispose with the engine**

In the existing mount `useEffect` that creates `SessionEngine` / `StayAwake`, also:

```ts
const media = new MediaSessionController();
mediaRef.current = media;
// in cleanup, before nulling refs:
media.dispose();
mediaRef.current = null;
```

- [ ] **Step 3: Keep handlers pointed at the live play/pause path**

`togglePlay` already enables wake on play and pauses via the engine. Update a ref each render so Media Session handlers never go stale:

```ts
const togglePlayRef = useRef(togglePlay);
togglePlayRef.current = togglePlay;

useEffect(() => {
  mediaRef.current?.setHandlers({
    play: () => togglePlayRef.current(),
    pause: () => togglePlayRef.current(),
  });
}, []);
```

Note: both `play` and `pause` call `togglePlay` only if that matches current button behavior when the OS sends the complementary action. Prefer explicit handlers that mirror the button’s branches so OS “pause” always pauses and “play” always plays:

```ts
useEffect(() => {
  mediaRef.current?.setHandlers({
    play: async () => {
      const engine = engineRef.current;
      if (!engine?.ready || engine.playing) return;
      previewRef.current?.stop();
      wakeRef.current?.enable();
      await engine.play();
    },
    pause: async () => {
      const engine = engineRef.current;
      if (!engine?.ready || !engine.playing) return;
      await engine.pause();
    },
  });
}, []);
```

Use the **explicit** play/pause handlers above (not toggle) so lock-screen Pause cannot accidentally start playback.

- [ ] **Step 4: Set metadata when the session is known**

Inside `Player` (session prop is always defined):

```ts
useEffect(() => {
  mediaRef.current?.setMetadata({
    title: sessionLabel(session),
    artist: 'SleepCode',
    album: session.theme,
    artworkPath: '/og.jpg',
  });
}, [session]);
```

- [ ] **Step 5: Sync playbackState**

In the existing effect that reacts to `playing` (or a small dedicated one):

```ts
useEffect(() => {
  mediaRef.current?.setPlaying(playing);
}, [playing]);
```

Also ensure `wakeRef.current?.disable()` still runs when `playing` becomes false (existing code) — do not change that.

- [ ] **Step 6: Typecheck**

Run: `cd membership-site && npx tsc --noEmit`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add membership-site/src/app/application/player/page.tsx
git commit -m "$(cat <<'EOF'
Wire Media Session metadata and play/pause into the player.

EOF
)"
```

---

### Task 3: Manual verification notes (no code)

**Files:** none

- [ ] **Step 1: Confirm checklist against the spec**

After deploy or local device testing:

1. iPhone Safari: start session → lock → Control Center / lock screen shows title; pause/resume match the page
2. Android Chrome: same for notification / lock screen
3. Leaving `/application/player` clears Media Session (dispose)
4. No seek/skip controls appear from our handlers

- [ ] **Step 2: If lock-screen UI never appears on a target device**

Do **not** expand scope in this plan. File a follow-up for the silent `<audio>` focus bridge called out in the spec’s out-of-scope section.

---

## Spec coverage (self-review)

| Spec requirement | Task |
|------------------|------|
| Thin controller Approach 1 | Task 1 |
| Metadata title / artist / album / og.jpg artwork | Task 2 Step 4 |
| play / pause only | Task 1 + Task 2 Step 3 |
| Sync playbackState | Task 2 Step 5 |
| Clear on unmount | Task 2 Step 2 |
| No engine / StayAwake / silent audio changes | Constraints + Task 2 |
| Device verification | Task 3 |
