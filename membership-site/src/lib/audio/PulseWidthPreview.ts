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

/**
 * Short pulse demo for width picking. Prefer playOnce — stops any in-flight shot
 * when the user picks another width quickly.
 */
export class PulseWidthPreview {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private widthNode: PulseWidthNode | null = null;
  private source: AudioBufferSourceNode | null = null;
  private buffer: AudioBuffer | null = null;
  private loadedUrl: string | null = null;
  private width: PulseWidth = DEFAULT_PULSE_WIDTH;
  private masterLevel = 0.5;
  private playId = 0;
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

  /** One-shot pulse at `width`. Cancels any previous shot still playing. */
  async playOnce(pulseUrl: string, width: PulseWidth): Promise<void> {
    if (this.disposed || !pulseUrl) return;
    const id = ++this.playId;
    this.stopSource();
    this.setWidth(width);
    const ctx = this.ensure();
    await ctx.resume().catch(() => {});

    if (!this.buffer || this.loadedUrl !== pulseUrl) {
      const response = await fetch(pulseUrl);
      if (!response.ok) throw new Error(`Pulse preview failed (${response.status}).`);
      const buffer = await ctx.decodeAudioData(await response.arrayBuffer());
      if (id !== this.playId || this.disposed) return;
      this.buffer = buffer;
      this.loadedUrl = pulseUrl;
    }
    if (id !== this.playId || this.disposed) return;
    this.startOnce(id);
  }

  /** @deprecated Prefer playOnce for width picking. */
  async start(pulseUrl: string): Promise<void> {
    await this.playOnce(pulseUrl, this.width);
  }

  stop(): void {
    this.playId += 1;
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
    this.loadedUrl = null;
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

  private startOnce(id: number): void {
    if (!this.ctx || !this.buffer || !this.widthNode) return;
    this.stopSource();
    this.widthNode.setWidth(this.width);
    const source = this.ctx.createBufferSource();
    source.buffer = this.buffer;
    source.loop = false;
    source.connect(this.widthNode.input);
    source.onended = () => {
      if (id !== this.playId) return;
      this.source = null;
    };
    source.start();
    this.source = source;
  }

  private stopSource(): void {
    if (!this.source) return;
    try {
      this.source.onended = null;
      this.source.stop();
      this.source.disconnect();
    } catch {
      // Already stopped.
    }
    this.source = null;
  }
}
