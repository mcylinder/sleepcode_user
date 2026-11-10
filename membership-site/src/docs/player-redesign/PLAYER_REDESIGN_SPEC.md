# Player redesign — implementation spec

Design canvas (all rounds and explorations): https://claude.ai/artifact/LU59f3xfwv4p6JpngH3cKM
Visual reference: `player-reference.html` in this folder (open in a browser; drag the controls, tap the tiles). It is a reference only — build in React/Tailwind using the existing tokens and components.

Screens: `img/01-default.png` … `img/06-playing.png`. Control states: `img/07-control-states.png`.

Paths below are relative to `src/`. Scope: `app/application/player/page.tsx`, `components/ui/*`, `lib/playerPrefs.ts`, `app/globals.css`. Audio engine behavior (`lib/audio/*`) does not change.

---

## 1. What changes, in one list

1. The settings stack under the play button (Set session length pill, Pulse width row, Blend slider, Each statement chips, Volume knob) is replaced by **one row of five tiles** — Timer, Voice, Pulse width, Repeat, Volume — with **one inline panel** below that opens for the selected tile.
2. The **play/pause button moves into the center of the Rings**.
3. **Blend → Voice**: 20-step control, teal voice on the left, gray pulse on the right; only the voice % is shown.
4. **Volume knob → fill bar**.
5. **Pulse width** moves from a sheet to the inline panel, with width glyphs.
6. **Repeat** copy: Once / Twice / Four times.
7. **7-night history dots** with day letters under the title.
8. **Night shade** button uses a moon icon (text stays "Night shade").

## 2. Removed on purpose — do not add back

- Affirmation/statement counts anywhere on this screen.
- Summary text ("Tonight: fades out after…", "Plays 30 min, then fades out", "Ready when you are" as filler).
- Presets (Drift off / Balanced / etc.). The listener sets the blend themselves.
- Any countdown **ring** or circular timer around the play button.
- Words like "mostly" / "more" for the blend. No "Pulse NN%" label.
- Automatic screen dimming. Night shade stays a manual button.
- Streak text ("5 nights this week", "6-night streak"). Dots only.

## 3. Layout (390 × 844 reference, top → bottom)

| Block | Notes |
|---|---|
| Top bar | Unchanged: `‹ Back` · Transcript (icon) · `?` · Night shade (moon icon + "Night shade"). |
| Rings + play | Existing `Rings` (glow while playing). Play/pause sits centered on the rings: 84px circle, `bg-p-accent`, icon `text-p-on-accent`, 27px Play/Pause icons. Rings box ~230px (keep current clamp sizing). |
| Title | Existing `<h1>` label. Status line (`role="status"`) can stay for errors/loading but should be empty in the normal idle state. |
| History dots | 7 dots + day letters, centered, 12px below title. See §6. |
| Flexible space | `flex: 1`. Tiles and panel sit at the bottom of the screen. |
| Tile row | 5 equal tiles, 8px gap. See §4. |
| Panel | 10px below tiles; only one open at a time; none open by default. |

Background still switches to `--p-bg-playing` while playing (existing behavior).

## 4. Tile row — new `components/ui/PlayerTiles.tsx`

Each tile is a `<button>` 72px tall, radius 16px, `bg: var(--p-panel)`, border `1px var(--p-panel-border)`, icon (18px) above a 13px label.

| Tile | Icon | Label | Tap |
|---|---|---|---|
| Timer | `StopwatchIcon` | `fmtLength(lengthMinutes)` | Opens the **existing Session length sheet** (hours 0–10 × minutes). No inline panel. |
| Voice | voice icon (§8), teal `--p-accent` | `{instruction}%` | Toggles Voice panel |
| Width | width glyph (§7) | Center / Narrow / Wide / Full | Toggles Width panel (and starts `PulseWidthPreview`, as `openWidthSheet` does today) |
| Repeat | repeat icon (§8) | Once / Twice / 4 times | Toggles Repeat panel |
| Volume | speaker icon (§8, waves follow level) | `{volume}%` | Toggles Volume panel |

- Open tile: `aria-expanded="true"`, border `1.5px var(--p-accent)`, bg `var(--p-tile-active)`.
- Tapping the open tile closes the panel. Opening another tile swaps panels.
- `fmtLength`: `null → "Length"`, `< 60 → "45 min"`, whole hours `→ "8 hr"`, else `"1:30"`.
- Tile label "4 times" (not "Four times") because of tile width; panel uses the full word.

## 5. Panels

Container: radius 18px, padding 16px, `bg var(--p-panel)`, border `1px var(--p-panel-border)`, 12px gap.

### 5a. Voice — `components/ui/VoiceSteps.tsx` (replaces `BlendSlider` in the player)

> This section is authoritative. Ignore any older “unlit steps are outlines” rule.

**What it means.** One value: `prefs.instruction` (0–100) = how much **voice** you hear. Pulse is the remainder (`100 − instruction`) and is never shown as a number. **Voice is on the left, pulse on the right.** Teal = voice, gray = pulse.

| Value | Steps |
|---|---|
| 0% (pulse only) | all 20 gray |
| 50% | left 10 teal, right 10 gray |
| 100% (voice only) | all 20 teal |

Every step is **always filled**. No empty or outlined steps.

- Label: `Voice to pulse blend` (14px, `--p-muted`), then header `{instruction}%` (20px, 600). No "Voice"/"Pulse" labels under the icons.
- Row: **voice icon** (22px, LEFT, `--p-accent` teal) · 20 steps · **pulse icon** (22px, RIGHT, `--p-fg` white). 10px gaps.
- Steps: 20 equal flex items, 3px gap, 32px tall, radius 4px.
- Colors, step `i` (0 = leftmost, next to the voice icon), `voiceSteps = Math.round(instruction / 5)`:
  - `i < voiceSteps` → **voice / teal**, brightest at the voice icon: `t = 1 - i/19; lerp(--p-voice-deep rgb(56,96,92), --p-voice-bright rgb(176,224,218), t)`
  - otherwise → **pulse / gray**, brightest at the pulse icon: `t = i/19; lerp(--p-pulse-deep rgb(62,72,70), --p-pulse-bright rgb(168,174,171), t)`
  - A step's color depends only on its position and side, so colors don't shift while dragging; only the teal/gray boundary moves.
- **Result of each action:**
  - Pointer down / drag anywhere on the row: `instruction = clamp(Math.round((x / width) * 20) * 5, 0, 100)`, x measured from the LEFT edge of the steps row.
  - Drag **right** → more teal → **more voice**. Drag **left** → more gray → **more pulse**. Full left = 0, full right = 100.
  - Keys: ArrowRight/ArrowUp +5, ArrowLeft/ArrowDown −5, Home 0, End 100.
  - Every change calls `setInstruction(value)` (which already calls `engine.setBalance(engineBalance(value))`, `engineBalance = 100 − instruction`). Do not change the engine.
  - The header % and the Voice tile label update live while dragging.
- a11y: `role="slider"`, `aria-label="Voice level"`, `aria-valuemin=0`, `aria-valuemax=100`, `aria-valuenow={instruction}`, `aria-valuetext="Voice {n}%"`.
- Voice tile (§4) uses the same teal voice icon and shows `{instruction}%`.

### 5b. Volume — new `components/ui/VolumeFill.tsx` (replaces `VolumeKnob`)

- Bar: 60px tall, radius 18px, `bg var(--p-well)` (= `--p-sheet`), overflow hidden.
- Content: speaker icon left, `{volume}%` right (18px, 600), 18px side padding.
- **Two identical content layers**: light layer (`--p-fg` on the well) underneath; dark layer (`--p-on-accent` on `--p-accent`) on top, clipped with `clip-path: inset(0 {100 - volume}% 0 0)`. This makes the number and icon split color exactly at the fill edge (see 85% in `07-control-states.png`). Dark layer is `aria-hidden`.
- Speaker icon: muted (×) at 0, one wave 1–66, two waves ≥ 67.
- Interaction: drag anywhere, continuous 0–100. Arrow keys ±5, Home/End. `role="slider"`, `aria-label="Volume"`.

### 5c. Pulse width — update `PulseWidthPicker` (player tone)

- Label "Pulse width" (14px, `--p-muted`), then 4 equal buttons in a row, 60px tall, radius 12px: glyph above label.
- Selected: bg `--p-fg`, text `--p-on-accent`, weight 600. Others: transparent, border `--p-chip-border`.
- `role="radiogroup"` / `role="radio"` + `aria-checked` (as today). Values unchanged (`0/33/66/100`).
- Keep the preview behavior that the width sheet has today (start on open, stop on close).

### 5d. Repeat

- Label "Repeat each statement", then 3 equal buttons: **Once / Twice / Four times**, each with 1/2/4 small dots above the word. Same selected style as 5c. Values unchanged (`1/2/4`).

## 6. History dots

- 7 columns, 14px gap. Each: 8px dot over an 11px day letter, 6px gap.
- Order: oldest → **today last**. Letters from each date's weekday (`'SMTWTFS'[date.getDay()]`), so they shift daily.
- Listened: dot filled `--p-accent`. Not listened: 1.5px ring `#5d706d`. Today, not yet listened: 1.5px ring and letter in `--p-today` (#e8c9a0, letter 600). Today, listened: filled dot, letter still `--p-today`.
- `role="img" aria-label="Listening over the last 7 nights"`.
- **Data (new)**: there is no history store yet. Proposal: in the existing 60-second listening effect (where `saveLastPlayed` runs), also record the local date into `localStorage['sleepcode_listen_nights']` (array of `YYYY-MM-DD`, keep the last 14). See open question Q2.
- If a streak badge is ever added elsewhere, never show it for a 1-night streak.

## 7. Pulse width glyph

34×6 SVG: a 34×4 track (radius 2) plus a centered fill: Center = 3px-radius dot, Narrow = 12px, Wide = 22px, Full = 34px (whole track). Track `--p-step-outline`, fill `--p-accent` (inverted colors on the selected cream button — see `03-width-open.png`).

## 8. Icons — add to `components/ui/icons.tsx` (1.6–1.8px stroke, `currentColor`)

- `MoonIcon` (Night shade): `M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z`
- `VoiceIcon`: head `circle(9,8,r3.5)`, shoulders `M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6`, waves `M17 6.5a4 4 0 010 5`, `M19.5 4a7.5 7.5 0 010 10`
- `PulseIcon`: dot `r2` filled + rings `r6`, `r10`
- `RepeatIcon`: `M17 2l4 4-4 4` `M3 11v-1a4 4 0 014-4h14` `M7 22l-4-4 4-4` `M21 13v1a4 4 0 01-4 4H3`
- `SpeakerIcon({ level })`: body `M4 10v4h4l5 4V6L8 10z` (viewBox 0 0 26 24); waves `M16.5 9a4 4 0 010 6`, `M19.5 6a8 8 0 010 12`; muted `M17 9l5 6M22 9l-5 6`

Exact markup for all of these is in `player-reference.html` (object `I`).

## 9. Tokens — add to `:root` in `app/globals.css`

```css
--p-panel:        #2b3a38;
--p-panel-border: rgba(231, 225, 214, 0.12);
--p-tile-active:  #31474a;
--p-well:         var(--p-sheet);
--p-step-outline: #627673;
--p-today:        #e8c9a0;
--p-voice-bright: rgb(176, 224, 218);
--p-voice-deep:   rgb(56, 96, 92);
--p-pulse-bright: rgb(168, 174, 171);
--p-pulse-deep:   rgb(62, 72, 70);
```

Existing `--p-*` tokens are used as-is for everything else.

## 10. Prefs (`lib/playerPrefs.ts`)

- No new fields required for the controls. Keep `instruction`, `volume`, `repeat`, `pulseWidth`, `lengthMinutes`.
- Voice steps are 5% each: round `instruction` to the nearest 5 in `loadPlayerPrefs` (current default 76 → 75; change `DEFAULT_PREFS.instruction` to 75). See Q3 for Account › Defaults.

## 11. States to build and check

- Idle (no panel open), each panel open, playing (dark bg, rings glowing, pause icon).
- Voice at 0 (all gray) / 25 / 50 / 75 / 100 (all teal); drag right and confirm teal grows from the left. Volume at 0 / 60 / 85 / 100 (85 shows the split number).
- `prefers-reduced-motion`: rings don't glow-animate (static at higher opacity).
- Night shade on: existing black overlay, unchanged.
- Width panel open → preview plays; panel closed → preview stops.

## 12. Open questions for Peter

- **Q1 — remaining-time readout.** The current page shows "H:MM left" with a progress bar while a length is set. The design removed countdowns (stressful for insomniacs). Proposal: drop it; the Timer tile shows only the chosen length.
- **Q2 — what counts as a night.** Proposal: ≥ 60 s of listening (same threshold as last-played), and anything before 4 am counts toward the previous night.
- **Q3 — Account › Defaults.** It still uses `BlendSlider`, `PulseWidthPicker` and "Each statement 1×/2×/4×". Update it to Voice steps / Once–Twice–Four times for consistency, or leave as is?
- **Q4 — copy.** Panel label says "Repeat each statement" to match the app's "statement" wording (the design canvas said "affirmation").

---

## Suggested prompt for Cursor

> Implement the player redesign described in `@src/docs/player-redesign/PLAYER_REDESIGN_SPEC.md`. Use `@src/docs/player-redesign/player-reference.html` and the PNGs in `src/docs/player-redesign/img/` as the visual reference. Work in `src/app/application/player/page.tsx`, `src/components/ui/`, `src/lib/playerPrefs.ts`, and `src/app/globals.css`. Do not change `src/lib/audio/*` engine behavior. Create `PlayerTiles`, `VoiceSteps`, and `VolumeFill` components; update `PulseWidthPicker` and `icons.tsx`. Respect §2 (removed items). Ask me about §12 before implementing those items.
