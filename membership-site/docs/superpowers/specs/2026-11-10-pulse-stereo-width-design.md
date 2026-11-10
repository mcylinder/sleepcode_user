# Pulse stereo width preference

**Date:** 2026-11-10  
**Status:** Approved  
**App:** `sleepcode_user/membership-site`

## Goal

Let listeners choose how wide the EMDR pulse stereo image feels (center through full L/R), save that preference like other player defaults, and hear the change in a looping pulse-only preview from both the player and Account → Defaults.

## Preference

Extend `PlayerPrefs` in `playerPrefs.ts`:

- Add `pulseWidth: 0 | 33 | 66 | 100`
- Default: **`33`** (Narrow)
- Persist in the existing `sleepcode_player_prefs` localStorage key
- Invalid / missing / non-allowed values on load → **`33`**

UI labels (no percentages shown):

| Value | Label  |
|-------|--------|
| 0     | Center |
| 33    | Narrow |
| 66    | Wide   |
| 100   | Full   |

Same store as instruction, volume, repeat, length, and voice. Player and Defaults both read/write via `loadPlayerPrefs` / `savePlayerPrefs`.

## Audio engine

`SessionEngine` continues to decode pulse without downmix. Width applies only to the **pulse** bus; instruction audio is unchanged.

Graph (conceptually):

```text
pulse sources → pulseGain → widthNode → master → destination
instruction  → instructionGain ─────────↗
```

Width node: ChannelSplitter → per-ear blend toward mid → ChannelMerger.

With width `w` in 0…1 (`pulseWidth / 100`) and mid = `(L + R) / 2`:

- `s = 1 − w` (collapse amount)
- Left out  = `(1 − s) · L + s · mid`
- Right out = `(1 − s) · R + s · mid`

So `0` = mono/center, `1` = untouched stereo file.

`setPulseWidth(0 | 33 | 66 | 100)` updates the live graph immediately for both session playback and the preview.

## Width sheet + preview

Shared **Pulse width** sheet component (same interaction pattern as the voice picker):

- Four radio-style choices: Center · Narrow · Wide · Full
- Opening the sheet starts a **looping pulse-only** preview through the same width graph
- Selecting a choice applies width live and saves prefs
- Closing the sheet stops the preview

**Player**

- Compact control near existing player controls showing the current label (e.g. “Narrow”)
- Opens the shared sheet
- If a session is playing when the sheet opens: **pause** the session; on close, leave it paused (user hits play)
- Preview uses the current session’s `pulse.m4a` URL

**Defaults (Account)**

- New expandable row (alongside Voice / Blend) showing the current label
- Same sheet inside the row
- Preview uses a resolvable shared pulse URL (e.g. current session media pulse when available, or a known free-session pulse path); if audio cannot load, the sheet still lets the user save a choice with no sound

## Preview volume

Preview must remain audible even when the user’s saved mix would silence the pulse.

- Preview is always **pulse-only** (instruction gain effectively off in the preview graph)
- If the user’s saved preferences would make pulse inaudible for preview purposes — specifically overall **volume = 0** and/or **instruction = 100** (pulse share 0) — the preview **overrides** master level to **50% of full volume**
- Otherwise preview may follow the user’s saved master volume (still pulse-only)
- This override applies only to the sheet preview, not to session playback after the sheet closes

## Out of scope

- Per-session width (global pref only)
- Continuous slider (discrete four choices only)
- Server-side / account-synced prefs (localStorage only, same as other player prefs)
- Changing the pulse file assets or Statement Studio export
- Applying width to instruction/voice audio

## Acceptance

1. Fresh install / cleared prefs → Narrow (33); Full is still available as a choice
2. Choosing a width on the player or in Defaults updates the other after reload (same localStorage key)
3. Sheet loops pulse only; changing Center → Full is clearly audible on stereo headphones
4. Opening the sheet mid-session pauses playback; closing leaves it paused
5. With volume 0 or instruction 100, opening the sheet still plays preview at 50% master
6. Session playback after close respects saved volume/blend; width continues to apply to pulse only
