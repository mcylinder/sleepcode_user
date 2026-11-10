# Pulse Stereo Width Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let listeners pick pulse stereo width (Center / Narrow / Wide / Full), persist it in player prefs (default Narrow), apply it live in `SessionEngine`, and preview with a looping pulse-only sheet from the player and Account → Defaults.

**Architecture:** Pure helpers + a shared Web Audio width node factory live in `pulseWidth.ts`. `SessionEngine` inserts that node on the pulse bus only. A small `PulseWidthPreview` loops `pulse.m4a` with the same width math and preview-volume override. `PulseWidthPicker` is the shared choice UI; player opens it in a `Sheet` (pausing session play), Defaults embeds it in an expandable row.

**Tech Stack:** Next.js App Router, TypeScript, Web Audio API, localStorage `playerPrefs`, existing `Sheet` / `ExpandableRow` patterns.

**Spec:** `docs/superpowers/specs/2026-11-10-pulse-stereo-width-design.md`

## Global Constraints

- Allowed widths: `0 | 33 | 66 | 100` only
- Default and invalid/missing fallback: **`33` (Narrow)**
- UI labels: **Center · Narrow · Wide · Full** — never show `%` in the UI
- Width applies to **pulse only**; instruction path unchanged; no pulse-file downmix
- Preview is pulse-only; if `volume === 0` or `instruction === 100`, preview master = **0.5**
- Prefs stay in `sleepcode_player_prefs` localStorage (no server sync)
- This package has **no unit-test runner** — verify with `npx tsc --noEmit`, `npm run lint`, and the acceptance checklist in the spec

## File map

| File | Role |
|------|------|
| `src/lib/audio/pulseWidth.ts` | Types, normalize, labels, preview volume, width-node factory |
| `src/lib/playerPrefs.ts` | Persist `pulseWidth` |
| `src/lib/audio/SessionEngine.ts` | Pulse bus → width node → master; `setPulseWidth` |
| `src/lib/audio/PulseWidthPreview.ts` | Looping pulse-only preview graph |
| `src/components/ui/PulseWidthPicker.tsx` | Four-choice UI (site + player tones) |
| `src/app/application/player/page.tsx` | Control + sheet + pause-on-open + session width |
| `src/components/account/DefaultsSection.tsx` | Expandable row + preview pulse URL |

---

### Task 1: Prefs + pure width helpers

**Files:**
- Create: `src/lib/audio/pulseWidth.ts`
- Modify: `src/lib/playerPrefs.ts`

**Interfaces:**
- Produces: `PulseWidth`, `PULSE_WIDTH_OPTIONS`, `DEFAULT_PULSE_WIDTH`, `normalizePulseWidth`, `pulseWidthLabel`, `previewMasterVolume`, `widthCollapse`, `stereoMixCoeffs`

- [ ] **Step 1: Add `src/lib/audio/pulseWidth.ts`**

```ts
export const PULSE_WIDTH_OPTIONS = [0, 33, 66, 100] as const;
export type PulseWidth = (typeof PULSE_WIDTH_OPTIONS)[number];
export const DEFAULT_PULSE_WIDTH: PulseWidth = 33;

const LABELS: Record<PulseWidth, string> = {
  0: 'Center',
  33: 'Narrow',
  66: 'Wide',
  100: 'Full',
};

export function normalizePulseWidth(value: unknown): PulseWidth {
  return PULSE_WIDTH_OPTIONS.includes(value as PulseWidth) ? (value as PulseWidth) : DEFAULT_PULSE_WIDTH;
}

export function pulseWidthLabel(width: PulseWidth): string {
  return LABELS[width];
}

/** Collapse amount s = 1 − w, with w = pulseWidth/100. */
export function widthCollapse(pulseWidth: PulseWidth): number {
  return 1 - pulseWidth / 100;
}

/**
 * Crossfeed coeffs for L/R → L/R so each ear gets (1−s)·own + s·mid.
 * Left out  = ownCoeff·L + crossCoeff·R
 * Right out = crossCoeff·L + ownCoeff·R
 */
export function stereoMixCoeffs(s: number): { own: number; cross: number } {
  return { own: 1 - s / 2, cross: s / 2 };
}

/** Preview master 0–1. Override to 0.5 when pulse would be inaudible. */
export function previewMasterVolume(volume: number, instruction: number): number {
  if (volume <= 0 || instruction >= 100) return 0.5;
  return Math.min(1, Math.max(0, volume / 100));
}

export interface PulseWidthNode {
  input: AudioNode;
  output: AudioNode;
  setWidth: (pulseWidth: PulseWidth) => void;
  dispose: () => void;
}

/** Build splitter → 4 gains → merger. Call setWidth before connecting audio. */
export function createPulseWidthNode(ctx: BaseAudioContext, initial: PulseWidth = DEFAULT_PULSE_WIDTH): PulseWidthNode {
  const splitter = ctx.createChannelSplitter(2);
  const merger = ctx.createChannelMerger(2);
  const ll = ctx.createGain();
  const lr = ctx.createGain();
  const rl = ctx.createGain();
  const rr = ctx.createGain();

  splitter.connect(ll, 0);
  splitter.connect(lr, 0);
  splitter.connect(rl, 1);
  splitter.connect(rr, 1);
  ll.connect(merger, 0, 0);
  lr.connect(merger, 0, 1);
  rl.connect(merger, 0, 0);
  rr.connect(merger, 0, 1);

  const apply = (pulseWidth: PulseWidth) => {
    const { own, cross } = stereoMixCoeffs(widthCollapse(pulseWidth));
    ll.gain.value = own;
    rr.gain.value = own;
    lr.gain.value = cross;
    rl.gain.value = cross;
  };
  apply(initial);

  return {
    input: splitter,
    output: merger,
    setWidth: apply,
    dispose: () => {
      try {
        splitter.disconnect();
        ll.disconnect();
        lr.disconnect();
        rl.disconnect();
        rr.disconnect();
        merger.disconnect();
      } catch {
        // Already disconnected.
      }
    },
  };
}
```

- [ ] **Step 2: Extend `playerPrefs.ts`**

Add to `PlayerPrefs`:

```ts
import { DEFAULT_PULSE_WIDTH, normalizePulseWidth, type PulseWidth } from '@/lib/audio/pulseWidth';

// in PlayerPrefs:
pulseWidth: PulseWidth;

// in DEFAULT_PREFS:
pulseWidth: DEFAULT_PULSE_WIDTH,

// in loadPlayerPrefs return:
pulseWidth: normalizePulseWidth(raw.pulseWidth),
```

Keep `voiceId` and other fields unchanged. `savePlayerPrefs` already JSON-stringifies the whole object — no change beyond including the new field on writes from callers.

- [ ] **Step 3: Typecheck**

Run: `cd "/Users/peterducharme/Projects/All SleepCode Code/sleepcode_user/membership-site" && npx tsc --noEmit`

Expected: PASS (or only pre-existing errors unrelated to these files)

- [ ] **Step 4: Commit**

```bash
git add src/lib/audio/pulseWidth.ts src/lib/playerPrefs.ts
git commit -m "$(cat <<'EOF'
feat: add pulseWidth pref and stereo width helpers

EOF
)"
```

---

### Task 2: SessionEngine pulse width bus

**Files:**
- Modify: `src/lib/audio/SessionEngine.ts`

**Interfaces:**
- Consumes: `createPulseWidthNode`, `DEFAULT_PULSE_WIDTH`, `PulseWidth` from `pulseWidth.ts`
- Produces: `setPulseWidth(width: PulseWidth): void` on `SessionEngine`

- [ ] **Step 1: Wire the width node in `ensureContext`**

Import helpers. Add private fields:

```ts
private pulseWidthNode: PulseWidthNode | null = null;
private pulseWidth: PulseWidth = DEFAULT_PULSE_WIDTH;
```

Change graph construction so pulse goes through width before master:

```ts
this.master = ctx.createGain();
this.master.gain.value = this.volume;
this.instructionGain = ctx.createGain();
this.pulseGain = ctx.createGain();
this.pulseWidthNode = createPulseWidthNode(ctx, this.pulseWidth);
this.instructionGain.connect(this.master);
this.pulseGain.connect(this.pulseWidthNode.input);
this.pulseWidthNode.output.connect(this.master);
this.master.connect(ctx.destination);
```

Do **not** reconnect instruction through the width node.

- [ ] **Step 2: Add `setPulseWidth`**

```ts
setPulseWidth(value: PulseWidth): void {
  this.pulseWidth = normalizePulseWidth(value);
  this.pulseWidthNode?.setWidth(this.pulseWidth);
}
```

Call `setPulseWidth` from the player whenever prefs load or change (Task 4). Default field is already `DEFAULT_PULSE_WIDTH` (33).

- [ ] **Step 3: Dispose the width node**

In `dispose()`, after stopping/closing context:

```ts
this.pulseWidthNode?.dispose();
this.pulseWidthNode = null;
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`  
Expected: PASS for SessionEngine changes

- [ ] **Step 5: Commit**

```bash
git add src/lib/audio/SessionEngine.ts
git commit -m "$(cat <<'EOF'
feat: apply pulse stereo width on SessionEngine pulse bus

EOF
)"
```

---

### Task 3: PulseWidthPreview + PulseWidthPicker

**Files:**
- Create: `src/lib/audio/PulseWidthPreview.ts`
- Create: `src/components/ui/PulseWidthPicker.tsx`

**Interfaces:**
- Consumes: `createPulseWidthNode`, `previewMasterVolume`, `PulseWidth`, labels/options
- Produces: `PulseWidthPreview` class with `start(url)`, `setWidth`, `setPrefsVolume(volume, instruction)`, `stop`, `dispose`; `PulseWidthPicker` React component

- [ ] **Step 1: Create `PulseWidthPreview.ts`**

Looping pulse-only graph (no instruction). Uses the same width node factory.

```ts
import {
  createPulseWidthNode,
  DEFAULT_PULSE_WIDTH,
  normalizePulseWidth,
  previewMasterVolume,
  type PulseWidth,
  type PulseWidthNode,
} from './pulseWidth';

function audioContextClass(): typeof AudioContext {
  const legacy = (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  return window.AudioContext ?? legacy;
}

export class PulseWidthPreview {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private widthNode: PulseWidthNode | null = null;
  private source: AudioBufferSourceNode | null = null;
  private buffer: AudioBuffer | null = null;
  private width: PulseWidth = DEFAULT_PULSE_WIDTH;
  private masterLevel = 0.5;
  private loadId = 0;
  private disposed = false;

  setPrefsVolume(volume: number, instruction: number): void {
    this.masterLevel = previewMasterVolume(volume, instruction);
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(this.masterLevel, this.ctx.currentTime, 0.03);
    }
  }

  setWidth(width: PulseWidth): void {
    this.width = normalizePulseWidth(width);
    this.widthNode?.setWidth(this.width);
  }

  async start(pulseUrl: string): Promise<void> {
    if (this.disposed || !pulseUrl) return;
    const id = ++this.loadId;
    this.stopSource();
    const ctx = this.ensure();
    await ctx.resume().catch(() => {});
    const response = await fetch(pulseUrl);
    if (!response.ok) throw new Error(`Pulse preview failed (${response.status}).`);
    const buffer = await ctx.decodeAudioData(await response.arrayBuffer());
    if (id !== this.loadId || this.disposed) return;
    this.buffer = buffer;
    this.startLoop();
  }

  stop(): void {
    this.loadId += 1;
    this.stopSource();
  }

  dispose(): void {
    this.disposed = true;
    this.stop();
    this.widthNode?.dispose();
    this.widthNode = null;
    this.ctx?.close().catch(() => {});
    this.ctx = null;
    this.master = null;
    this.buffer = null;
  }

  private ensure(): AudioContext {
    if (this.ctx) return this.ctx;
    const ctx = new (audioContextClass())();
    this.master = ctx.createGain();
    this.master.gain.value = this.masterLevel;
    this.widthNode = createPulseWidthNode(ctx, this.width);
    this.widthNode.output.connect(this.master);
    this.master.connect(ctx.destination);
    this.ctx = ctx;
    return ctx;
  }

  private startLoop(): void {
    if (!this.ctx || !this.buffer || !this.widthNode) return;
    this.stopSource();
    const source = this.ctx.createBufferSource();
    source.buffer = this.buffer;
    source.loop = true;
    source.connect(this.widthNode.input);
    source.start();
    this.source = source;
  }

  private stopSource(): void {
    if (!this.source) return;
    try {
      this.source.stop();
      this.source.disconnect();
    } catch {
      // Already stopped.
    }
    this.source = null;
  }
}
```

- [ ] **Step 2: Create `PulseWidthPicker.tsx`**

Mirror `VoicePicker` tone styling (`site` | `player`):

```tsx
'use client';

import {
  PULSE_WIDTH_OPTIONS,
  pulseWidthLabel,
  type PulseWidth,
} from '@/lib/audio/pulseWidth';

export default function PulseWidthPicker({
  selected,
  onSelect,
  tone = 'site',
}: {
  selected: PulseWidth;
  onSelect: (width: PulseWidth) => void;
  tone?: 'site' | 'player';
}) {
  const player = tone === 'player';
  return (
    <div className="flex flex-col gap-2" role="radiogroup" aria-label="Pulse width">
      {PULSE_WIDTH_OPTIONS.map((width) => {
        const isSelected = width === selected;
        return (
          <button
            key={width}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(width)}
            className={`flex min-h-[48px] items-center rounded-[14px] border px-4 text-left text-[16px] font-semibold ${
              isSelected
                ? player
                  ? 'border-p-accent bg-p-accent/15 text-p-fg'
                  : 'border-accent bg-accent/10 text-ink'
                : player
                  ? 'border-p-chip-border bg-transparent text-p-fg'
                  : 'border-hairline bg-bg-alt text-ink'
            }`}
          >
            {pulseWidthLabel(width)}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`  
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/lib/audio/PulseWidthPreview.ts src/components/ui/PulseWidthPicker.tsx
git commit -m "$(cat <<'EOF'
feat: add pulse width preview engine and picker UI

EOF
)"
```

---

### Task 4: Player control + sheet

**Files:**
- Modify: `src/app/application/player/page.tsx`

**Interfaces:**
- Consumes: `PulseWidthPicker`, `PulseWidthPreview`, `pulseWidthLabel`, `SessionEngine.setPulseWidth`, prefs `pulseWidth`
- Produces: working player width control wired to prefs + live session + preview

- [ ] **Step 1: State and refs**

Near other sheet state:

```ts
const [widthSheetOpen, setWidthSheetOpen] = useState(false);
const previewRef = useRef<PulseWidthPreview | null>(null);
const pulseUrlRef = useRef<string | null>(null);
```

When `buildPlayPlan` succeeds and you have `plan.pulseUrl`, set `pulseUrlRef.current = plan.pulseUrl`.

On engine create / prefs load (same place as `setVolume` / `setBalance`):

```ts
engine.setPulseWidth(saved.pulseWidth);
```

- [ ] **Step 2: Open / close width sheet**

```ts
async function openWidthSheet() {
  const engine = engineRef.current;
  if (engine?.playing) await engine.pause();
  setWidthSheetOpen(true);
  const preview = previewRef.current ?? new PulseWidthPreview();
  previewRef.current = preview;
  preview.setPrefsVolume(prefs.volume, prefs.instruction);
  preview.setWidth(prefs.pulseWidth);
  const url = pulseUrlRef.current;
  if (url) {
    try {
      await preview.start(url);
    } catch {
      // Sheet still usable without audio.
    }
  }
}

function closeWidthSheet() {
  setWidthSheetOpen(false);
  previewRef.current?.stop();
}

function chooseWidth(pulseWidth: PulseWidth) {
  engineRef.current?.setPulseWidth(pulseWidth);
  previewRef.current?.setWidth(pulseWidth);
  updatePrefs({ pulseWidth });
}
```

Dispose preview in the same cleanup that disposes `SessionEngine`.

Ensure `updatePrefs` already merges + `savePlayerPrefs` (existing helper on this page).

- [ ] **Step 3: UI — control + Sheet**

Place a compact control near the repeat / volume row (e.g. full-width button under that grid, or a third row). Show current label only (no `%`):

```tsx
<button
  type="button"
  onClick={() => void openWidthSheet()}
  className="flex min-h-[44px] w-full items-center justify-between rounded-full border border-p-chip-border px-4 text-[14px] text-p-fg"
>
  <span className="text-p-muted">Pulse width</span>
  <span className="font-semibold">{pulseWidthLabel(prefs.pulseWidth)}</span>
</button>
```

Add sheet (alongside session length / voice sheets):

```tsx
<Sheet open={widthSheetOpen} onClose={closeWidthSheet} label="Pulse width" tone="player">
  <SheetHeader title="Pulse width" onCancel={closeWidthSheet} tone="player" />
  <p className="text-[14px] leading-snug text-p-muted">
    How wide the pulse feels between your ears. Applies to every session.
  </p>
  <PulseWidthPicker selected={prefs.pulseWidth} onSelect={chooseWidth} tone="player" />
</Sheet>
```

Do **not** auto-resume play on close (spec: leave paused).

- [ ] **Step 4: Manual check + typecheck**

Run: `npx tsc --noEmit` then `npm run dev`  
Verify on player with headphones:

1. Control shows **Narrow** on fresh prefs  
2. Opening sheet mid-play pauses; preview loops pulse; Center→Full is audible  
3. Closing leaves session paused; play resumes with chosen width  
4. Volume 0 or Instruction 100 → preview still audible at half master

- [ ] **Step 5: Commit**

```bash
git add src/app/application/player/page.tsx
git commit -m "$(cat <<'EOF'
feat: player pulse width sheet with live preview

EOF
)"
```

---

### Task 5: Account Defaults row

**Files:**
- Modify: `src/components/account/DefaultsSection.tsx`

**Interfaces:**
- Consumes: `PulseWidthPicker`, `PulseWidthPreview`, `pulseWidthLabel`, `FEATURED_FREE_SESSION`, `mediaVoiceId`, `fetchSessionMedia`, `buildPlayPlan`

- [ ] **Step 1: Extend Defaults state**

```ts
const [open, setOpen] = useState<'voice' | 'repeat' | 'blend' | 'width' | null>(null);
const previewRef = useRef<PulseWidthPreview | null>(null);
const [previewUrl, setPreviewUrl] = useState<string | null>(null);
```

On mount (after `loadPlayerPrefs`), resolve a pulse URL once:

```ts
useEffect(() => {
  let cancelled = false;
  (async () => {
    const free = FEATURED_FREE_SESSION;
    const voiceId = mediaVoiceId(loadPlayerPrefs().voiceId);
    if (!free || !voiceId) return;
    try {
      const signed = await fetchSessionMedia(free.id, voiceId);
      const plan = buildPlayPlan(signed.manifest, signed.fileUrl);
      if (!cancelled) setPreviewUrl(plan.pulseUrl);
    } catch {
      // Choices still save without preview audio.
    }
  })();
  return () => {
    cancelled = true;
    previewRef.current?.dispose();
    previewRef.current = null;
  };
}, []);
```

(`signed.manifest` / `signed.fileUrl` — match whatever `fetchSessionMedia` already returns; mirror player page load path.)

- [ ] **Step 2: Start/stop preview when the width row opens**

```ts
const toggle = (row: 'voice' | 'repeat' | 'blend' | 'width') => {
  setOpen((current) => {
    const next = current === row ? null : row;
    if (current === 'width' && next !== 'width') previewRef.current?.stop();
    if (next === 'width') void startWidthPreview();
    return next;
  });
};

async function startWidthPreview() {
  const preview = previewRef.current ?? new PulseWidthPreview();
  previewRef.current = preview;
  const current = loadPlayerPrefs();
  preview.setPrefsVolume(current.volume, current.instruction);
  preview.setWidth(current.pulseWidth);
  if (!previewUrl) return;
  try {
    await preview.start(previewUrl);
  } catch {
    // Silent failure; row still works.
  }
}

function chooseWidth(pulseWidth: PulseWidth) {
  previewRef.current?.setWidth(pulseWidth);
  update({ pulseWidth });
}
```

When `update` changes `volume` or `instruction` while width row is open, also call `previewRef.current?.setPrefsVolume(...)`.

- [ ] **Step 3: Add ExpandableRow**

After the Instruction / Pulse row:

```tsx
<ExpandableRow
  label="Pulse width"
  value={pulseWidthLabel(prefs.pulseWidth)}
  open={open === 'width'}
  onToggle={() => toggle('width')}
>
  <PulseWidthPicker selected={prefs.pulseWidth} onSelect={chooseWidth} tone="site" />
</ExpandableRow>
```

- [ ] **Step 4: Verify Defaults ↔ player**

1. Set Wide in Defaults → reload player → control shows Wide; engine uses Wide  
2. Set Center on player → reload Account → row shows Center  
3. Open Defaults width with volume 0 → preview still audible  
4. `npx tsc --noEmit` and `npm run lint` PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/account/DefaultsSection.tsx
git commit -m "$(cat <<'EOF'
feat: Defaults pulse width row with preview

EOF
)"
```

---

## Spec coverage check

| Spec requirement | Task |
|------------------|------|
| `pulseWidth` in prefs; default/fallback 33 | 1 |
| Labels Center/Narrow/Wide/Full, no % | 1, 3, 4, 5 |
| Width node on pulse bus only; formula | 1 (`stereoMixCoeffs`), 2 |
| Shared sheet/picker; pulse-only loop | 3, 4, 5 |
| Player control; pause on open; stay paused | 4 |
| Defaults row + shared pulse URL | 5 |
| Preview volume override 50% | 1 (`previewMasterVolume`), 3–5 |
| Out of scope (no server sync, no voice width) | respected |

## Acceptance (from spec)

1. Cleared prefs → Narrow; Full available  
2. Player and Defaults share localStorage  
3. Sheet loops pulse; width changes audible on headphones  
4. Mid-session open pauses; close leaves paused  
5. volume 0 or instruction 100 → preview at 50% master  
6. After close, session volume/blend unchanged; width still on pulse only
