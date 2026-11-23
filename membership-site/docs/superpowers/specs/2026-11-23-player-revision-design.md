# Player revision (Mix, Settings, Backgrounds)

**Date:** 2026-11-23  
**Status:** Approved  
**App:** `sleepcode_user/membership-site`  
**Visual reference:** repo root `SleepCode Player Revision.html` (frames A–G)  
**Written checklist:** repo root `player-revision-spec.md`

## Goal

Revise the player chrome and listening settings so Mix lives on the main screen, Level is removed (device volume), and Settings + Length replace the three tiles. Add a Background leaf (Pulse widths, Nature, Music) with preview/select. Extend the audio engine for background loops, mix gains, Spacing Off (including Music beat-snap). Mirror the new settings in Account → Defaults.

## Approach

**Incremental rewrite of the current player (Approach 1).**

- Keep `src/app/play/[id]/page.tsx`, `SessionEngine`, StayAwake, Media Session, membership gates
- Replace bottom tiles with Mix fader + Settings / Length icon CTAs
- Fold Sound into a Settings sheet + Background leaf page
- Extend prefs + Account Defaults; add `backgrounds.json` + CloudFront signer for `background/`
- Do not rebuild the player shell from scratch

## Decisions (locked)

| Topic | Choice |
|-------|--------|
| Nature / Music | Full wiring; Rain + Slow Harbor ready in S3; other rows shown but disabled until uploaded |
| Account Defaults | Mirror Settings (Narrator, Background, Repeat, Spacing); no Level |
| Length | Spec presets: 30m / 1h / **2h default** / 4h / 8h / Custom › (max 10h) |
| Mix default | Reset to **75 · 25** (voice · background); no migration from old blend |
| Mix semantics | Fill from left = background share; fully left = bg silent; fully right = voice at floor (~0.15) |
| Spacing Off | Full: trim trailing silence + ~0.3s gap; with Music, snap line starts to next beat (0.667s @ 90 BPM) |
| Not-ready rows | Visible, disabled (no preview/select) |
| Pulse status line | `Owen · Pulse (Wide)` (include width name) |
| Narrator preview | First affirmation clip of the free session (`fresh-start`) for the selected voice |

## Player chrome (frames A–B)

Top to bottom:

1. Top bar unchanged (Back · Transcript · Tips · Night shade)
2. Rings + play/pause unchanged
3. Title unchanged (`{Session} · {Theme}` / Part n of m)
4. **Status line (new):** `{Narrator} · {Background}`; Pulse uses `{Narrator} · Pulse ({Width})`. Read-only; replaces “Change” link
5. Sessions / nights week row unchanged
6. **Mix fader** on the player — left: voice icon + “Voice”; right: background name + group icon; center mono readout `75 · 25`; track `--p-track`, fill `--accent`, knob `--ink` 22px
7. **Two icon CTAs** (~88px apart): Settings (sliders); Length (clock; label `2h` idle, live `h:mm` countdown while playing; `--accent` + mono when set)
8. Night shade unchanged (manual or existing auto timeout). No new setting
9. **Level removed** — fixed `masterGain` at the previous default (~0.8)

## Length sheet (frame C)

- Title “Length”, Done
- Subline: `Stops around {local time}` (now + selected length, live)
- Options: 30 minutes, 1 hour, 2 hours (default), 4 hours, 8 hours, Custom › (existing hour/minute picker, max 10 hr)
- Helper: voice and background stop together with a short fade (~5–10 s)
- Behavior: voice loops for the whole length; both stop together at the end

## Settings sheet (frame D)

Full-height sheet. Groups in order:

1. **Narrator** — Owen / Clara rows: preview button + name + description; tap row to select (✓ + `--selected-bg`). Preview plays the **first line of `fresh-start`** for that voice via `<audio>` (signed free-session path). Persists like today.
2. **Background** — one row: group icon + current name + group subtitle + › → Background leaf
3. **Repeat** — Once · Twice · 4×; helper: how many times each affirmation plays before the next
4. **Spacing** — “Pause between affirmations” toggle; default **On** (current timing)

## Background leaf (frames E–G)

- Slides in from the right inside Settings; header `‹ Settings` · Background · Done
- Opens on the tab of the current background
- Tabs: **Pulse · Nature · Music**

### Pulse

- Subhead: “Bilateral audio stimulation”
- 2×2 cards: Center (mono), Narrow, Wide, Full — maps to existing `pulseWidth` 0 / 33 / 66 / 100
- Tap selects immediately as the background (no separate preview control)
- Helper: neutral headphones wording; no health claims

### Nature / Music

- Catalog: `src/data/backgrounds.json`
- Dev-ready files:
  - `s3://slpcd-media/background/nature/rain.m4a`
  - `s3://slpcd-media/background/music/slow-harbor.m4a`
- Remaining stub rows: `ready: false` → shown disabled
- Preview button → shared `<audio>` (`preload="none"`, short fade); one preview at a time; duck session background while previewing
- Tap row → stop preview, decode into Web Audio buffer (row spinner), ~1s crossfade from previous background, release old buffer; update status line + Mix right label
- Previewing and in-use are independent states

## Audio

**Signal chain:** voice → voiceGain; background (pulse+width node, or nature/music `AudioBufferSourceNode.loop`) → bgGain; both → fixed masterGain → destination.

- Mix sets voiceGain / bgGain (equal-power or linear crossfade + voice floor ~0.15)
- Load only the selected background (~12 MB nature / ~35 MB music decoded upper bound); never preload all
- Pulse: existing per-session `pulse.m4a`; width from Pulse cards (migrate saved `pulseWidth`)
- Nature ~30 s seamless stereo; Music ~96 s (or 120 s) @ 90 BPM; prefer loop lengths that are multiples of 4 s / 8 s
- Set `loopStart` / `loopEnd` or deliver Opus/FLAC if AAC padding clicks in Safari
- Spacing On = current slot timing; Off = trim trailing silence + ~0.3 s gap; Music + Off also beat-snaps line starts
- Serving: `Content-Type: audio/mp4` on `.m4a`; CORS for `<audio crossOrigin>` previews if routed through Web Audio
- iOS: `navigator.audioSession.type = "playback"` where supported; Media Session keeps current metadata; set `album` to the background name

## Prefs & Account Defaults

Persist (localStorage when signed out; account when signed in), same pattern as today:

- Mix (default 75 · 25; reset old blend / instruction)
- Narrator (`voiceId`)
- Background id + group; when Pulse, also width (`pulseWidth`)
- Repeat
- Spacing (default On)

Remove Level from player and Defaults UI. Defaults section lists Narrator, Background, Repeat, Spacing (and opens the same controls or equivalent editors).

## API & data

- Catalog: `src/data/backgrounds.json` (already stubbed)
- New media route (or equivalent) to sign CloudFront access under `background/` (prefix or per-file), same TTL / trust model as `session/`
- Session audio signing unchanged: `session/{voiceId}/{sessionId}/`
- Narrator preview: sign free session `fresh-start` for the preview voice and play the first statement file from its manifest

## Copy

- Pulse subhead / FAQ / How to listen: “bilateral audio stimulation” (replace “auditory bilateral stimulation” where it appears)
- Update Mix / Width / Level FAQ and How to listen for the new controls; add short entries for backgrounds and Spacing
- Status examples: `Clara · Rain`, `Owen · Pulse (Wide)`, `Clara · Slow Harbor`

## Out of scope

Transcript overlay, Tips sheet, Night shade behavior, week-dot logic, pricing (backgrounds included), presets (on hold), marketing look beyond player/settings copy updates listed above.

## Verification

- Idle player matches frame A structure (status, Mix, two CTAs)
- Playing: Length countdown `h:mm`; Mix still works; night shade unchanged
- Length sheet end-time updates; Custom still works; end fade stops voice + background
- Settings: narrator preview plays first Fresh Start line per voice; Background leaf Pulse/Nature/Music; Rain + Slow Harbor selectable; others disabled
- Switching Rain ↔ Pulse ↔ Slow Harbor crossfades; only one buffer retained
- Spacing Off with Music beat-snaps; Spacing On matches prior timing
- Account Defaults reflects new fields; mix defaults to 75 · 25 for existing users
- Signed-out free session still plays; backgrounds sign successfully for members (and free path as implemented)

## Success criteria

Player matches the revision frames for chrome and sheets; Pulse + Rain + Slow Harbor fully usable; remaining backgrounds listed but disabled; Level gone; Account Defaults aligned; no regression to overnight play / Media Session / StayAwake.
