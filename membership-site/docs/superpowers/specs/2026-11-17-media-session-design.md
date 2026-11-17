# Media Session metadata (play / pause)

**Date:** 2026-11-17  
**Status:** Approved  
**App:** `sleepcode_user/membership-site`  
**Audit:** A5 (lock-screen / overnight playback — partial)

## Goal

Expose SleepCode playback to the OS media UI (lock screen, Control Center, notification shade) with session title/artwork and play/pause only. Keep Web Audio (`SessionEngine`) as the sole audio engine. Do not add seek, skip, or a silent `<audio>` focus bridge in this pass.

## Approach

**Thin controller + wire from the player** (Approach 1).

- New helper: `src/lib/audio/MediaSessionController.ts`
- Player page owns play/pause; the controller only mirrors state and forwards OS actions into that same path
- `SessionEngine` stays unchanged
- `StayAwake` stays unchanged (screen wake is separate from Media Session)

## Metadata

When a session is ready on the player:

| Field    | Value |
|----------|--------|
| `title`  | `sessionLabel(session)` (e.g. `First Date · Part 1 of 4`) |
| `artist` | `SleepCode` |
| `album`  | `session.theme` (e.g. `Connection`) |
| `artwork`| Absolute URLs for `/og.jpg` at 256×256 and 512×512 |

Update metadata when the loaded session changes. Clear metadata (and handlers) on player unmount.

## Actions

Register only:

- `play` → same path as the on-screen Play control (`engine.play()` after any length/wake setup the button already does)
- `pause` → same path as the on-screen Pause control (`engine.pause()`)

Do **not** register `seekto`, `seekforward`, `seekbackward`, `previoustrack`, or `nexttrack`.

Sync `navigator.mediaSession.playbackState` to `'playing'` / `'paused'` whenever engine playing state changes. Ignore unsupported browsers (`'mediaSession' in navigator` guard).

## Out of scope

- Silent looping `<audio>` “focus bridge” (add only if real-device tests show lock-screen UI never appears)
- Media Session position state / scrubber
- Changing overnight background-audio policy beyond what Web Audio already does
- New artwork assets (reuse `public/og.jpg`)

## Verification

Manual, on a real device after ship:

1. Start a session on iPhone Safari → lock → Control Center / lock screen shows title and play/pause; pause/resume match the page
2. Same on Android Chrome notification / lock screen
3. Leaving the player clears or stops exposing the session
4. Overnight listen still relies on existing Web Audio + `StayAwake`; Media Session alone is not treated as a fix for OS killing background audio

## Success criteria

- Lock screen / system media UI shows SleepCode session title when playback is active (where the browser grants Media Session)
- Play and pause from that UI control the same engine state as the player button
- No new seek/skip affordances; no engine rewrite
