# Player Revision Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the player revision — Mix on the main screen, Settings + Length icon CTAs, Background leaf (Pulse / Nature / Music), Spacing Off with Music beat-snap, Level removed, Account Defaults aligned.

**Architecture:** Incremental rewrite of `play/[id]/page.tsx` and `SessionEngine`. Shared backgrounds live under `s3://slpcd-media/background/` and are signed via a new API route. Prefs gain mix/background/spacing; UI replaces tiles with Mix fader + sheets matching `SleepCode Player Revision.html`.

**Tech Stack:** Next.js 15 App Router, TypeScript, Web Audio API, CloudFront signed URLs, existing Sheet / icons / StayAwake / MediaSessionController.

**Spec:** `docs/superpowers/specs/2026-11-23-player-revision-design.md`

## Global Constraints

- Approach 1 only — extend current player/engine; do not rebuild a parallel player shell
- Mix default **75 · 25** (voice · background); **do not** migrate old `instruction` / blend values
- Voice floor ~**0.15** when Mix is fully toward background; fill from the left = background share
- Level control removed; fixed `masterGain` **0.8**
- Length presets: 30m / 1h / **2h default** / 4h / 8h / Custom › (max 10h); voice + background stop together with short fade
- Spacing On = current timing; Off = trim trailing silence + **0.3s** gap; Music + Off also beat-snaps to **0.667s** @ 90 BPM
- Not-ready Nature/Music rows: visible, disabled
- Pulse status line: `{Narrator} · Pulse ({Width})`
- Narrator preview: first affirmation of free session **`fresh-start`** for that voice
- Dev-ready files: `background/nature/rain.m4a`, `background/music/slow-harbor.m4a`
- This package has **no unit-test runner** — verify with `npx tsc --noEmit` and the manual checks in each task
- Commit after each task

## File map

| File | Role |
|------|------|
| `src/data/backgrounds.json` | Catalog (already stubbed) |
| `src/lib/backgrounds.ts` | Typed accessors, status-line label, ready checks |
| `src/lib/playerPrefs.ts` | Prefs v2: mix, backgroundId, spacing; drop Level from UI |
| `src/lib/audio/mix.ts` | Mix → voiceGain/bgGain (+ voice floor) |
| `src/lib/audio/spacing.ts` | Trim silence helpers + beat snap offset |
| `src/app/api/media/background/route.ts` | Sign `background/` prefix |
| `src/lib/audio/SessionEngine.ts` | bgGain, setBackground buffer, spacing modes, continuous bg loop |
| `src/components/ui/MixFader.tsx` | On-player Mix control |
| `src/components/ui/PlayerCtas.tsx` | Settings + Length icon CTAs |
| `src/components/ui/PlayerSettingsSheet.tsx` | Settings + Background leaf |
| `src/app/play/[id]/page.tsx` | Wire chrome, sheets, engine, previews |
| `src/components/account/DefaultsSection.tsx` | Narrator / Background / Repeat / Spacing |
| `src/data/faq.ts`, `src/app/(site)/how-to-listen/page.tsx` | Copy updates |
| `src/lib/audio/MediaSessionController.ts` / player wire | `album` = background name |

---

### Task 1: Backgrounds catalog module

**Files:**
- Create: `src/lib/backgrounds.ts`
- Modify: `src/data/backgrounds.json` only if field names need tightening for TypeScript

**Interfaces:**
- Produces:
  - `BackgroundGroup = 'pulse' | 'nature' | 'music'`
  - `BackgroundSelection = { group: 'pulse'; width: PulseWidth } | { group: 'nature' | 'music'; id: string }`
  - `DEFAULT_BACKGROUND: BackgroundSelection` → `{ group: 'pulse', width: DEFAULT_PULSE_WIDTH }`
  - `listNature(): NatureItem[]`, `listMusic(): MusicItem[]`
  - `findNature(id)`, `findMusic(id)`
  - `isReady(item: { ready: boolean }): boolean`
  - `backgroundStatusLabel(selection, narratorName): string` → e.g. `Clara · Rain`, `Owen · Pulse (Wide)`
  - `backgroundMixLabel(selection): { name: string; group: BackgroundGroup }` for Mix right side
  - `s3PathFor(selection): string | null` — `null` for pulse (session-local); else `background/nature/rain.m4a` style path from JSON

- [ ] **Step 1: Add `src/lib/backgrounds.ts`**

```ts
import data from '@/data/backgrounds.json';
import { DEFAULT_PULSE_WIDTH, pulseWidthLabel, type PulseWidth } from '@/lib/audio/pulseWidth';

export type BackgroundGroup = 'pulse' | 'nature' | 'music';

export type BackgroundSelection =
  | { group: 'pulse'; width: PulseWidth }
  | { group: 'nature' | 'music'; id: string };

export const DEFAULT_BACKGROUND: BackgroundSelection = {
  group: 'pulse',
  width: DEFAULT_PULSE_WIDTH,
};

export type NatureItem = (typeof data.nature)[number];
export type MusicItem = (typeof data.music)[number];

export function listNature(): NatureItem[] {
  return data.nature;
}
export function listMusic(): MusicItem[] {
  return data.music;
}
export function findNature(id: string): NatureItem | null {
  return data.nature.find((n) => n.id === id) ?? null;
}
export function findMusic(id: string): MusicItem | null {
  return data.music.find((m) => m.id === id) ?? null;
}
export function isReady(item: { ready?: boolean }): boolean {
  return item.ready === true;
}

export function backgroundStatusLabel(selection: BackgroundSelection, narratorName: string): string {
  if (selection.group === 'pulse') {
    return `${narratorName} · Pulse (${pulseWidthLabel(selection.width)})`;
  }
  const item = selection.group === 'nature' ? findNature(selection.id) : findMusic(selection.id);
  return `${narratorName} · ${item?.name ?? selection.id}`;
}

export function backgroundMixLabel(selection: BackgroundSelection): { name: string; group: BackgroundGroup } {
  if (selection.group === 'pulse') return { name: 'Pulse', group: 'pulse' };
  const item = selection.group === 'nature' ? findNature(selection.id) : findMusic(selection.id);
  return { name: item?.name ?? selection.id, group: selection.group };
}

export function s3PathFor(selection: BackgroundSelection): string | null {
  if (selection.group === 'pulse') return null;
  const item = selection.group === 'nature' ? findNature(selection.id) : findMusic(selection.id);
  return item?.path ?? null;
}
```

- [ ] **Step 2: Typecheck**

Run: `cd membership-site && npx tsc --noEmit`  
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/lib/backgrounds.ts src/data/backgrounds.json
git commit -m "Add typed backgrounds catalog helpers."
```

---

### Task 2: Prefs v2 (mix, background, spacing)

**Files:**
- Modify: `src/lib/playerPrefs.ts`

**Interfaces:**
- Produces updated `PlayerPrefs`:
  - `voiceMix: number` — voice share 0–100, steps of 5, **default 75** (background share = `100 - voiceMix`)
  - `background: BackgroundSelection` — default Pulse + Narrow
  - `spacing: boolean` — default `true` (On)
  - `repeat`, `voiceId` unchanged
  - `volume` kept internally at **80** for master 0.8 but **not shown in UI**
  - Remove reliance on `instruction` / `pulseWidth` as top-level for new code; still read old `pulseWidth` once to seed `background` when group is pulse
- Produces: `PREFS_VERSION = 2`; on load, if stored version `< 2`, **force `voiceMix: 75`** (ignore old instruction/blend)
- Produces: `mixReadout(voiceMix): string` → `"75 · 25"`
- Keep `engineBalance` only if still needed; prefer new `mix.ts` in Task 3

- [ ] **Step 1: Rewrite prefs types and load/save**

Implement roughly:

```ts
import { DEFAULT_BACKGROUND, type BackgroundSelection } from '@/lib/backgrounds';
import { DEFAULT_PULSE_WIDTH, normalizePulseWidth, type PulseWidth } from '@/lib/audio/pulseWidth';

export const PREFS_VERSION = 2;

export interface PlayerPrefs {
  version: number;
  voiceMix: number; // 0–100 voice share
  volume: number; // fixed UI-less master percent; default 80
  repeat: RepeatCount;
  voiceId: string | null;
  background: BackgroundSelection;
  spacing: boolean; // true = On
}

export const DEFAULT_PREFS: PlayerPrefs = {
  version: PREFS_VERSION,
  voiceMix: 75,
  volume: 80,
  repeat: 2,
  voiceId: null,
  background: DEFAULT_BACKGROUND,
  spacing: true,
};

export function mixReadout(voiceMix: number): string {
  const v = Math.min(100, Math.max(0, Math.round(voiceMix)));
  return `${v} · ${100 - v}`;
}
```

In `loadPlayerPrefs`:
- Parse JSON
- If `raw.version !== 2`, set `voiceMix = 75` (do not migrate instruction)
- Else load `voiceMix` rounded to 5%
- Background: if stored object valid, use it; else if old `pulseWidth` present, `{ group: 'pulse', width: normalizePulseWidth(...) }`; else `DEFAULT_BACKGROUND`
- `spacing`: default `true` if missing
- Always persist `version: 2` on next `savePlayerPrefs`

- [ ] **Step 2: Update all compile breakages that import `instruction` / `pulseWidth` from prefs** — temporary shims OK only inside this commit if player still uses old fields; prefer fixing call sites in later tasks but **tsc must pass**. Minimal approach for this task: keep deprecated getters:

```ts
/** @deprecated use voiceMix */
export function legacyInstruction(prefs: PlayerPrefs): number {
  return prefs.voiceMix;
}
```

…only if needed; better to update `RangeSlider.mixValueText` consumers in Task 6–9. For this task, update `DefaultsSection` compile errors with temporary labels or leave Defaults until Task 9 — **tsc must pass**.

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`  
Expected: PASS (fix any broken imports in this commit)

- [ ] **Step 4: Commit**

```bash
git add src/lib/playerPrefs.ts src/components/account/DefaultsSection.tsx
git commit -m "Bump player prefs to mix, background, and spacing."
```

---

### Task 3: Mix gain helpers

**Files:**
- Create: `src/lib/audio/mix.ts`

**Interfaces:**
- Produces:
  - `VOICE_FLOOR = 0.15`
  - `mixGains(voiceMix: number): { voice: number; background: number }`
    - `t = (100 - voiceMix) / 100` (background share 0–1)
    - Equal-power: `background = sin(t * π/2)`, `voice = cos(t * π/2)`
    - Then `voice = max(voice, VOICE_FLOOR * t)` so at full background (`t=1`) voice ≥ 0.15; at `t=0` voice stays ~1 and bg 0

Clarify formula so full-left (voiceMix=100, t=0) → bg≈0, voice≈1; full-right (voiceMix=0, t=1) → bg≈1, voice≈0.15:

```ts
export const VOICE_FLOOR = 0.15;

export function mixGains(voiceMix: number): { voice: number; background: number } {
  const voiceShare = Math.min(100, Math.max(0, voiceMix)) / 100;
  const t = 1 - voiceShare; // background share
  const voiceEq = Math.cos(t * Math.PI * 0.5);
  const bgEq = Math.sin(t * Math.PI * 0.5);
  const voice = t <= 0 ? voiceEq : Math.max(voiceEq, VOICE_FLOOR * t);
  return { voice, background: bgEq };
}
```

- [ ] **Step 1: Create `mix.ts` as above**

- [ ] **Step 2: Typecheck + Commit**

```bash
npx tsc --noEmit
git add src/lib/audio/mix.ts
git commit -m "Add mix gain helpers with voice floor."
```

---

### Task 4: Sign `background/` media

**Files:**
- Create: `src/app/api/media/background/route.ts`
- Modify: `src/lib/authedFetch.ts` (add `fetchBackgroundMedia` helper)

**Interfaces:**
- `POST /api/media/background` → `signPrefix('background/', TTL)` same shape as session route (`baseUrl`, `query`, `expiresAt`)
- Auth: require signed-in **or** allow signed-out (backgrounds are not sold separately; free session also needs Rain preview). **Decision for implementer:** allow optional auth like free session — any caller may receive a short-TTL signature for `background/` (TTL e.g. 9h). If product later gates music, tighten then.
- Client helper:

```ts
export async function fetchBackgroundSigned(): Promise<SignedPrefix> {
  const user = auth.currentUser;
  if (user) return authedFetch('/api/media/background', {});
  const res = await fetch('/api/media/background', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  if (!res.ok) throw new Error('Could not sign background media');
  return res.json();
}
```

- [ ] **Step 1: Create route**

```ts
import { NextResponse } from 'next/server';
import { errorResponse } from '@/lib/firebaseAdmin';
import { signPrefix } from '@/lib/cloudfront';

export const runtime = 'nodejs';
const TTL_SECONDS = 9 * 60 * 60;

export async function POST() {
  try {
    return NextResponse.json(signPrefix('background/', TTL_SECONDS));
  } catch (error) {
    return errorResponse(error, 'Error signing background media');
  }
}
```

- [ ] **Step 2: Add client helper in `authedFetch.ts` (or small `src/lib/backgroundMedia.ts`)**

- [ ] **Step 3: Typecheck + Commit**

```bash
npx tsc --noEmit
git add src/app/api/media/background/route.ts src/lib/authedFetch.ts
git commit -m "Add CloudFront signing for background media."
```

---

### Task 5: SessionEngine — background loop + spacing

**Files:**
- Create: `src/lib/audio/spacing.ts`
- Modify: `src/lib/audio/SessionEngine.ts`

**Interfaces:**
- Consumes: `mixGains` from Task 3
- Produces on `SessionEngine`:
  - `setVoiceMix(voiceMix: number): void` — applies `mixGains` to instructionGain + bgGain (rename pulseGain → bgGain internally or keep pulseGain as the bg bus)
  - `setSpacing(on: boolean): void`
  - `setBackgroundBuffer(buffer: AudioBuffer | null, opts?: { bpm?: number }): void` — when non-null **and** not pulse mode, run a looping `AudioBufferSourceNode` into bgGain; stop per-statement pulse underlay for nature/music
  - `usePulseBackground(): void` — restore pulse-under-voice + gap behavior (current tick)
  - Master defaults to **0.8** via `setVolume(0.8)` from player (Level UI gone)
  - Spacing Off: for each clip, effective duration = trimmed end; schedule next at `end + 0.3` or beat-snapped when `bpm` set
- `spacing.ts`:

```ts
/** Return end offset (seconds) after trimming trailing near-silence. */
export function trimmedDuration(buffer: AudioBuffer, threshold = 0.01): number {
  const ch = buffer.getChannelData(0);
  let end = ch.length - 1;
  while (end > 0 && Math.abs(ch[end]) < threshold) end -= 1;
  return Math.max(0, (end + 1) / buffer.sampleRate);
}

/** Next beat boundary at or after `when`, given bpm and an origin time. */
export function snapToBeat(when: number, origin: number, bpm: number): number {
  const beat = 60 / bpm;
  const n = Math.ceil((when - origin) / beat - 1e-9);
  return origin + Math.max(0, n) * beat;
}
```

**Engine behavior notes:**
- Pulse mode: keep existing tick (statement + pulse underlay + gap pulse)
- Nature/Music: start one looping buffer on bgGain when play starts / when buffer set while playing; statements schedule on instructionGain only; gaps use spacing rules without pulse gap file
- Crossfade on buffer swap (~1s): ramp old bg source down, new up; disconnect old
- `fadeOutAndStop` / `fadeOutAndPause` must fade master (already does) — looping bg stops with `clearSources` / dedicated bgSource stop

- [ ] **Step 1: Add `spacing.ts`**

- [ ] **Step 2: Extend `SessionEngine`** with mix gains, bg loop source, spacing modes (implement carefully; keep dispose/stop clearing the loop source)

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`

- [ ] **Step 4: Manual smoke (local)** — play Fresh Start with Pulse; confirm no regression before UI rewrite

- [ ] **Step 5: Commit**

```bash
git add src/lib/audio/spacing.ts src/lib/audio/SessionEngine.ts
git commit -m "Extend SessionEngine for backgrounds and spacing."
```

---

### Task 6: MixFader + Player CTAs

**Files:**
- Create: `src/components/ui/MixFader.tsx`
- Create: `src/components/ui/PlayerCtas.tsx`
- Modify: `src/components/ui/icons.tsx` — add Settings (sliders), Length/clock if missing, leaf/note/pulse-bars as needed for Mix right icon

**Interfaces:**
- `MixFader({ voiceMix, backgroundName, backgroundGroup, onChange, disabled? })`
  - Readout `mixReadout(voiceMix)`
  - Slider: value = `100 - voiceMix` (background share) for fill/knob position; onChange converts back to voiceMix
  - Labels: Voice (left) · background name + icon (right)
- `PlayerCtas({ onSettings, onLength, lengthLabel, lengthActive })`
  - Two buttons, ~88px gap, 28px stroke icons, no tile chrome
  - Length label accent + mono when `lengthActive`

Match tokens from the HTML mock (`--accent`, `--ink-muted`, `--p-track`).

- [ ] **Step 1: Add icons if missing**

- [ ] **Step 2: Implement MixFader + PlayerCtas**

- [ ] **Step 3: Typecheck + Commit**

```bash
npx tsc --noEmit
git add src/components/ui/MixFader.tsx src/components/ui/PlayerCtas.tsx src/components/ui/icons.tsx
git commit -m "Add Mix fader and Settings/Length CTAs."
```

---

### Task 7: Length sheet presets

**Files:**
- Modify: `src/app/play/[id]/page.tsx` (length sheet section)
- Optionally create: `src/components/ui/LengthSheet.tsx` if it keeps the page smaller

**Interfaces:**
- Preset list: `[30, 60, 120, 240, 480]` minutes + Custom
- Default selection **120**
- Subline: `Stops around ${formatEndTime(Date.now() + lengthSec * 1000)}` using local time
- Custom opens existing hour/minute pickers (max 10h)
- Length CTA label: idle `2h` / `30m` / etc.; while playing and countdown started, `formatPlaybackClock`-style **h:mm** as in spec (`1:47` for 1h47m — use `h:mm` when ≥1h else `m:ss` only if under 1h; **spec says h:mm** for countdown — implement `formatLengthCountdown(remainingSec): string` as `H:MM` total minutes→hours)

```ts
export function formatLengthCountdown(remainingSec: number): string {
  const totalMin = Math.max(0, Math.ceil(remainingSec / 60));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}
export function formatLengthIdle(lengthSec: number): string {
  const min = Math.round(lengthSec / 60);
  if (min < 60) return `${min}m`;
  if (min % 60 === 0) return `${min / 60}h`;
  return formatLengthCountdown(lengthSec);
}
```

- [ ] **Step 1: Add format helpers to `playerPrefs.ts`**

- [ ] **Step 2: Replace length sheet UI with preset list + end-time line**

- [ ] **Step 3: Typecheck + Commit**

```bash
git commit -m "Restyle Length sheet to presets with end time."
```

---

### Task 8: Settings sheet + Background leaf

**Files:**
- Create: `src/components/ui/PlayerSettingsSheet.tsx` (Settings + nested Background view state)
- Modify: icons as needed

**Interfaces:**
- Props include: prefs, onChangePrefs, onClose, signedBackgroundBaseUrl+query (or fetch inside), sessionPlaying, onDuckBackground, narratorPreviewUrlForVoice(voiceId)

**Settings content:**
1. Narrator rows — preview button plays `<audio src={firstLineUrl}>`; row tap selects voiceId  
   - Resolve first line: reuse session media sign for `fresh-start` + voiceId, fetch manifest, take first statement filename from `buildPlayPlan` / manifest statements order (first in play plan or first `c*_v1`)
2. Background row → set internal view `'background'`
3. Repeat segmented Once / Twice / 4×
4. Spacing toggle

**Background leaf:**
- Header `‹ Settings` / Background / Done
- Tabs Pulse / Nature / Music
- Pulse 2×2 width cards → `onChange({ background: { group:'pulse', width }})` + engine `usePulseBackground` + `setPulseWidth`
- Nature/Music lists from catalog; `!ready` → `disabled` opacity
- Preview: single shared `<audio>` element; duck callback while playing
- Select: decode via fetch(signedUrl) → `engine.setBackgroundBuffer`; show row spinner until ready

- [ ] **Step 1: Implement PlayerSettingsSheet with both views**

- [ ] **Step 2: Typecheck**

- [ ] **Step 3: Commit**

```bash
git commit -m "Add Settings sheet and Background leaf."
```

---

### Task 9: Wire player page chrome

**Files:**
- Modify: `src/app/play/[id]/page.tsx`
- Remove/stop using: `PlayerTiles` Sound/Repeat tiles on this page (can leave component file for now)
- Modify: Media Session metadata `album` → background display name

**Steps:**
- [ ] **Step 1: Replace bottom tiles with status line + MixFader + PlayerCtas**
- [ ] **Step 2: Open Settings / Length sheets; remove old Sound panel Level/Mix/Width UI**
- [ ] **Step 3: On prefs.background change, sign + load nature/music or pulse**
- [ ] **Step 4: Apply `setVoiceMix`, `setSpacing`, fixed `setVolume(0.8)`**
- [ ] **Step 5: Status line from `backgroundStatusLabel`**
- [ ] **Step 6: Media Session `album` = mix/background name**
- [ ] **Step 7: Typecheck + manual pass against frames A–D**
- [ ] **Step 8: Commit**

```bash
git commit -m "Wire player chrome to Mix, Settings, and Length."
```

---

### Task 10: Account Defaults + copy

**Files:**
- Modify: `src/components/account/DefaultsSection.tsx`
- Modify: `src/data/faq.ts`
- Modify: `src/app/(site)/how-to-listen/page.tsx`
- Grep/replace “auditory bilateral stimulation” → “bilateral audio stimulation” in site copy

**Defaults rows:** Narrator, Background (name + group), Repeat, Spacing (On/Off). Remove Level + Width. Keep “Open the player” link. Mix can show as optional fifth row `75 · 25` readout (spec Settings doesn’t put Mix in Defaults — **omit Mix from Defaults**; only the four Settings groups).

- [ ] **Step 1: Update DefaultsSection**
- [ ] **Step 2: Update FAQ + How to listen**
- [ ] **Step 3: Typecheck + Commit**

```bash
git commit -m "Align Account Defaults and listening copy with the player revision."
```

---

### Task 11: Final verification

- [ ] **Step 1: `npx tsc --noEmit`**
- [ ] **Step 2: Manual checklist**
  - [ ] Frame A layout: status, Mix, Settings/Length CTAs
  - [ ] Length presets + end time + countdown on CTA
  - [ ] Narrator preview = first Fresh Start line per voice
  - [ ] Pulse widths update status `Owen · Pulse (Wide)`
  - [ ] Rain + Slow Harbor preview/select/crossfade
  - [ ] Other Nature/Music rows disabled
  - [ ] Spacing Off + Music beat-snaps (listen for alignment)
  - [ ] Level gone; device volume only
  - [ ] Defaults match Settings fields
  - [ ] Overnight / Media Session / StayAwake still work
- [ ] **Step 3: Commit any fixes**

---

## Spec coverage (self-review)

| Spec section | Task(s) |
|--------------|---------|
| Player chrome A–B | 6, 9 |
| Length sheet C | 7, 9 |
| Settings D | 8, 9 |
| Background E–G | 1, 4, 5, 8 |
| Audio chain / spacing / voice floor | 3, 5 |
| Prefs + Defaults | 2, 10 |
| API background/ | 4 |
| Narrator preview Fresh Start | 8 |
| Copy / bilateral term | 10 |
| Media Session album | 9 |
| Out of scope (transcript, tips, shade, pricing) | — untouched |

## Placeholder / consistency check

- No TBD steps; Rain / Slow Harbor paths match uploaded S3 keys and `backgrounds.json`
- `voiceMix` vs fill direction documented in Tasks 3 and 6
- `BackgroundSelection` type shared across prefs, catalog, engine wiring
