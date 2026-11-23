# SleepCode player revision: implementation spec

Visual reference: `sleepcode-player-revision.html` (frames A–G). Use existing tokens and components where possible: `--bg`, `--bg-alt`, `--surface`, `--ink`, `--ink-muted`, `--accent`, `--selected-bg`, `--highlight`, `--hairline`, `--hairline-strong`, `--p-track`, `--p-tile-active`, `--p-bg-playing`, `--ease-sheet`. Icons: 24-unit viewBox, `stroke="currentColor"`, stroke-width 1.5–1.6, round caps.

## Summary of changes

| Area | Before | After |
|---|---|---|
| Bottom controls | 3 tiles: Length · Sound (Level/Mix/Width) · Repeat | Mix fader + 2 icon CTAs: Settings · Length |
| Level | In the Sound panel | Removed (device volume). Keep a fixed internal gain (see Audio) |
| Mix | Voice ↔ Pulse, inside the Sound panel | Voice ↔ current background, on the player |
| Narrator | "Owen · Change" link under the title | Settings sheet |
| Width | Separate Sound setting | The four Pulse options on the Background page |
| Repeat | Main tile | Settings sheet |
| Spacing (new) | — | Settings sheet toggle |
| Background (new) | Pulse only | Pulse (4 widths), Nature (6), Music (12) |

## 1. Player screen (frames A, B)

Top to bottom:

1. Top bar: unchanged (‹ Back · Transcript · Tips · Night shade).
2. Rings + play/pause: unchanged.
3. Title `"{Session} · {Theme}"` (or `"· Part n of m"`): unchanged.
4. **Status line (new):** `"{Narrator} · {Background name}"`, 14px, `--ink-muted`. Read-only. Replaces the narrator "Change" link.
5. Sessions this week: unchanged.
6. **Mix fader (moved onto the player):**
   - Left label: voice icon + "Voice". Right label: background name + its group icon (pulse bars / leaf / note).
   - Center readout: `"70 · 30"` in IBM Plex Mono, `--ink-muted`.
   - Track `--p-track`, fill `--accent`, knob `--ink` 22px.
   - Fully left = background gain 0. Fully right = voice gain at its minimum floor (keep the voice audible; suggest floor 0.15).
   - Default 75 · 25 (current default).
   - Fill direction: fill runs from the left to the knob and represents the background share.
7. **Icon CTAs (replace the tiles):** two items, centered, about 88px apart.
   - Settings: sliders icon, label "Settings" in `--ink-muted`. Opens Settings sheet.
   - Length: clock icon. Label shows the value: `"2h"` idle; live countdown `"1:47"` (h:mm, tabular numerals) while playing. When a value is set, icon and label use `--accent`; label in IBM Plex Mono. Opens Length sheet.
   - Icons 28px, stroke 1.5, no tile background or border.
8. Night shade: unchanged (manual button, or automatic after the existing timeout). No new setting.

## 2. Length sheet (frame C)

- Bottom sheet, title "Length", "Done".
- Line under the title: `"Stops around {time}"` (now + selected length, local time, updates live).
- Options: 30 minutes, 1 hour, 2 hours (default), 4 hours, 8 hours, Custom › (opens the existing hour/minute picker, max 10 hr).
- Helper: "Voice and background stop together when the time is up, with a short fade."
- Behavior: voice loops for the whole length; voice and background stop together at the end with a short fade (about 5–10 s).

## 3. Settings sheet (frame D)

Full-height sheet, title "Settings", "Done". Groups in this order:

1. **Narrator:** card with Owen / Clara rows.
   - Each row: preview button (plays a short sample line via `<audio>`), name, description ("Low, even, unhurried." / "Clear, warm, steady.").
   - Tapping the row selects (✓ + `--selected-bg`). Saved to account like today.
2. **Background:** single row: group icon (accent) + current name + group as subtitle + ›. Opens the Background page (section 4).
3. **Repeat:** segmented control Once · Twice · 4×. Helper: "How many times each affirmation plays before the next."
4. **Spacing:** row "Pause between affirmations" / "A short silence after each line." with an on/off toggle. Default **On** (current behavior).

All settings persist per account (and localStorage when signed out), like the current listening settings.

## 4. Background page (frames E, F, G)

A leaf page inside the Settings sheet: slides in from the right; header "‹ Settings" (left), "Background" (center), "Done" (right). Opens on the tab of the current background.

Segmented tabs: **Pulse · Nature · Music** (with pulse-bars / leaf / note icons).

### Pulse tab
- Section label "Pulse", subhead **"Bilateral audio stimulation"**.
- Four cards in a 2×2 grid: **Center** (sub-label "mono"), **Narrow**, **Wide**, **Full**, each with a small left-ear/right-ear diagram.
- Tapping a card selects it as the background immediately (no separate preview button).
- Helper: "The pulse moves between your ears. Wider settings work best with headphones." Keep wording neutral; no health claims.

### Nature tab
- Card list of 6 rows: preview button · name · ✓ when in use. (Names TBD; placeholders: Rain, Fireplace, Wind, Ocean, Stream, Night Crickets.)

### Music tab
- Same row pattern, 12 rows, titles only (mood-evoking, TBD). The list scrolls.

### Row states (Nature and Music)
- **Default:** outlined round preview button with ▷.
- **Previewing:** filled `--accent` button with small animated level bars; subtitle "Previewing". Tap again to stop.
- **In use:** row background `--selected-bg` + ✓ at right.
- Previewing and in use are independent: you can preview one item while another is in use.

### Interaction
- Preview button → stream that file through a single shared `<audio>` element (`preload="none"`, short fade in and out). Only one preview at a time. If a session is playing, duck the current background while previewing.
- Tap row → select: stop the preview, fetch and decode the loop into a Web Audio buffer (show a small spinner in the row while decoding), crossfade from the old background (about 1 s), release the old buffer. Update the player status line and the Mix fader's right-hand label.

## 5. Audio behavior

- **Signal chain:** voice → voiceGain; background (pulse loop or nature/music buffer) → bgGain; both → masterGain (fixed) → destination.
  - Mix sets voiceGain/bgGain. Use an equal-power or simple linear crossfade, with the voice floor from section 1.
- **Level removed:** set masterGain to the old default (0.8) so existing listeners don't get louder, or normalize the files with headroom first.
- **Pulse:** existing pulse files. Width maps to the four Pulse options (replaces the old Width setting; migrate the saved `pulseWidth` to the matching option).
- **Nature loops:** about 30 s seamless stereo loops. Music loops: about 96 s stereo (or 120 s) at 90 BPM. Loop lengths should be multiples of the pulse cycle (4 s / 8 s) so they stay aligned.
  - Loop with `AudioBufferSourceNode.loop = true`.
  - Set `loopStart`/`loopEnd` to skip AAC encoder padding, or deliver loops as Opus/FLAC. Test for clicks at the loop point in Safari.
- **Memory:** load only the selected background (about 12 MB decoded for 30 s, about 35 MB for 96 s, stereo, 48 kHz). Never preload all 18.
- **Spacing:**
  - On = current timing (each affirmation in its slot, followed by its pause).
  - Off = trim each clip's trailing silence and start the next line after a short fixed gap (suggest 0.3 s). When Music is the background, snap each line's start to the next beat (0.667 s at 90 BPM) so the voice stays in time with the music.
- **Serving:** set `Content-Type: audio/mp4` on .m4a files (currently `audio/mp4a-latm`). CloudFront needs CORS headers for `<audio crossOrigin="anonymous">` previews if they are routed through Web Audio.
- **iOS:** set `navigator.audioSession.type = "playback"` where supported, so audio plays with the silent switch on. Keep the existing Media Session metadata; add the background name as `album`.

## 6. Copy

- Pulse subhead: "Bilateral audio stimulation" (use the same term in the FAQ and How to listen, replacing "auditory bilateral stimulation").
- Update the FAQ and How to listen sections for Mix, Width and Level to describe the new controls; add a short entry for backgrounds and for Spacing.
- Status line format: `Clara · Rain`, `Owen · Pulse`, `Clara · Slow Harbor`. For Pulse, optionally `Owen · Pulse (Wide)`.

## 7. Out of scope / unchanged

Transcript overlay, Tips sheet, Night shade, Sessions this week logic, pricing (backgrounds are included at the same price), presets (on hold).
