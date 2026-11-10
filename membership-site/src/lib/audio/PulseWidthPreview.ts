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
