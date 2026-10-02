import type { PlayPlan } from './playPlan';

const LOOKAHEAD_SEC = 0.2;
const SCHEDULE_INTERVAL_MS = 50;
const LOAD_CONCURRENCY = 6;

function audioContextClass(): typeof AudioContext {
  const legacy = (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  return window.AudioContext ?? legacy;
}

function downmixToMono(ctx: BaseAudioContext, buffer: AudioBuffer): AudioBuffer {
  if (buffer.numberOfChannels === 1) return buffer;
  const mono = ctx.createBuffer(1, buffer.length, buffer.sampleRate);
  const out = mono.getChannelData(0);
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, c) => buffer.getChannelData(c));
  for (let i = 0; i < buffer.length; i += 1) {
    let sum = 0;
    for (const channel of channels) sum += channel[i];
    out[i] = sum / channels.length;
  }
  return mono;
}

async function decodeUrl(ctx: BaseAudioContext, url: string): Promise<AudioBuffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Audio request failed (${response.status}).`);
  const decoded = await ctx.decodeAudioData(await response.arrayBuffer());
  return downmixToMono(ctx, decoded);
}

// Plays instruction clips and the pulse in lockstep: each clip starts together with a fresh
// copy of the pulse, both cut to the shorter length, scheduled gaplessly and looped.
export class SessionEngine {
  playing = false;
  ready = false;
  onPlayingChange: ((playing: boolean) => void) | null = null;

  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private instructionGain: GainNode | null = null;
  private pulseGain: GainNode | null = null;
  private clips: AudioBuffer[] = [];
  private pulse: AudioBuffer | null = null;
  private balance = 50;
  private repeat = 1;
  private clipIndex = 0;
  private pass = 0;
  private nextWhen = 0;
  private schedulerId: ReturnType<typeof setInterval> | null = null;
  private fadeTimer: ReturnType<typeof setTimeout> | null = null;
  private sources = new Set<AudioBufferSourceNode>();
  private loadId = 0;
  private disposed = false;

  private ensureContext(): AudioContext {
    if (this.ctx) return this.ctx;
    const ctx = new (audioContextClass())();
    this.master = ctx.createGain();
    this.instructionGain = ctx.createGain();
    this.pulseGain = ctx.createGain();
    this.instructionGain.connect(this.master);
    this.pulseGain.connect(this.master);
    this.master.connect(ctx.destination);
    this.ctx = ctx;
    this.applyMix(true);
    return ctx;
  }

  async load(plan: PlayPlan, onProgress?: (loaded: number, total: number) => void): Promise<void> {
    if (this.disposed) return;
    this.stop();
    const id = ++this.loadId;
    const ctx = this.ensureContext();
    this.ready = false;

    const urls = [...plan.statementUrls, plan.pulseUrl];
    const buffers: AudioBuffer[] = new Array(urls.length);
    let next = 0;
    let loaded = 0;
    const worker = async () => {
      while (next < urls.length && id === this.loadId) {
        const i = next++;
        buffers[i] = await decodeUrl(ctx, urls[i]);
        loaded += 1;
        if (id === this.loadId) onProgress?.(loaded, urls.length);
      }
    };
    await Promise.all(Array.from({ length: Math.min(LOAD_CONCURRENCY, urls.length) }, worker));
    if (id !== this.loadId) return;

    this.pulse = buffers.pop() ?? null;
    this.clips = buffers;
    this.clipIndex = 0;
    this.pass = 0;
    this.ready = this.clips.length > 0 && !!this.pulse;
  }

  // 0 = all instruction, 100 = all pulse (equal-power).
  setBalance(value: number): void {
    this.balance = Math.min(100, Math.max(0, value));
    this.applyMix();
  }

  // Takes effect from the next clip boundary.
  setRepeat(count: number): void {
    this.repeat = Math.max(1, Math.round(count));
    if (this.pass >= this.repeat) this.advance();
  }

  async play(): Promise<void> {
    if (!this.ready) return;
    const ctx = this.ensureContext();
    this.cancelFade();
    if (ctx.state !== 'running') await ctx.resume();
    if (this.playing) return;
    if (this.nextWhen < ctx.currentTime + 0.05) this.nextWhen = ctx.currentTime + 0.05;
    this.setPlaying(true);
    this.tick();
    this.schedulerId = setInterval(() => this.tick(), SCHEDULE_INTERVAL_MS);
  }

  // Suspending freezes the audio clock, so already-scheduled clip/pulse pairs resume in sync.
  async pause(): Promise<void> {
    if (!this.playing) return;
    this.stopScheduler();
    this.setPlaying(false);
    if (this.ctx?.state === 'running') await this.ctx.suspend();
  }

  stop(): void {
    this.stopScheduler();
    this.cancelFade();
    for (const source of this.sources) {
      try {
        source.stop();
        source.disconnect();
      } catch {
        // Already stopped.
      }
    }
    this.sources.clear();
    this.clipIndex = 0;
    this.pass = 0;
    this.nextWhen = 0;
    this.setPlaying(false);
    if (this.ctx?.state === 'running') this.ctx.suspend().catch(() => {});
  }

  fadeOutAndStop(seconds: number): void {
    if (!this.ctx || !this.master || !this.playing) {
      this.stop();
      return;
    }
    const gain = this.master.gain;
    const now = this.ctx.currentTime;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(gain.value, now);
    gain.linearRampToValueAtTime(0, now + seconds);
    this.fadeTimer = setTimeout(() => this.stop(), seconds * 1000);
  }

  // iOS can suspend the context while the page is hidden.
  resumeIfPlaying(): void {
    if (this.playing && this.ctx && this.ctx.state !== 'running') this.ctx.resume().catch(() => {});
  }

  dispose(): void {
    this.disposed = true;
    this.loadId += 1;
    this.stop();
    this.ctx?.close().catch(() => {});
    this.ctx = null;
    this.clips = [];
    this.pulse = null;
    this.ready = false;
    this.onPlayingChange = null;
  }

  private setPlaying(playing: boolean): void {
    if (this.playing === playing) return;
    this.playing = playing;
    this.onPlayingChange?.(playing);
  }

  private applyMix(immediate = false): void {
    if (!this.ctx || !this.instructionGain || !this.pulseGain) return;
    const t = this.balance / 100;
    const voice = Math.cos(t * Math.PI * 0.5);
    const pulse = Math.sin(t * Math.PI * 0.5);
    if (immediate) {
      this.instructionGain.gain.value = voice;
      this.pulseGain.gain.value = pulse;
      return;
    }
    const now = this.ctx.currentTime;
    this.instructionGain.gain.setTargetAtTime(voice, now, 0.03);
    this.pulseGain.gain.setTargetAtTime(pulse, now, 0.03);
  }

  private cancelFade(): void {
    if (this.fadeTimer) clearTimeout(this.fadeTimer);
    this.fadeTimer = null;
    if (this.ctx && this.master) {
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.value = 1;
    }
  }

  private stopScheduler(): void {
    if (this.schedulerId) clearInterval(this.schedulerId);
    this.schedulerId = null;
  }

  private advance(): void {
    this.pass = 0;
    this.clipIndex = (this.clipIndex + 1) % Math.max(1, this.clips.length);
  }

  private tick(): void {
    const ctx = this.ctx;
    if (!this.playing || !ctx || !this.ready || !this.pulse) return;
    while (this.nextWhen < ctx.currentTime + LOOKAHEAD_SEC) {
      const clip = this.clips[this.clipIndex];
      const duration = Math.min(clip.duration, this.pulse.duration);
      if (duration <= 0) return;
      this.startSource(clip, this.instructionGain!, this.nextWhen, duration);
      this.startSource(this.pulse, this.pulseGain!, this.nextWhen, duration);
      this.nextWhen += duration;
      this.pass += 1;
      if (this.pass >= this.repeat) this.advance();
    }
  }

  private startSource(buffer: AudioBuffer, destination: AudioNode, when: number, duration: number): void {
    const source = this.ctx!.createBufferSource();
    source.buffer = buffer;
    source.connect(destination);
    source.start(when, 0, duration);
    this.sources.add(source);
    source.onended = () => this.sources.delete(source);
  }
}
