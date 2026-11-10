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
export function createPulseWidthNode(
  ctx: BaseAudioContext,
  initial: PulseWidth = DEFAULT_PULSE_WIDTH,
): PulseWidthNode {
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
