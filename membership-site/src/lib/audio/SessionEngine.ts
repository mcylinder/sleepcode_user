import type { PlayPlan } from './playPlan';

const LOOKAHEAD_SEC = 0.2;
const SCHEDULE_INTERVAL_MS = 50;
const LOAD_CONCURRENCY = 6;
// Softens buffer start/stop so cutting the under-voice pulse and starting the gap pulse
// don't click at the boundary.
const SOURCE_FADE_SEC = 0.012;

function audioContextClass(): typeof AudioContext {
  const legacy = (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  return window.AudioContext ?? legacy;
}

async function decodeUrl(ctx: BaseAudioContext, url: string): Promise<AudioBuffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Audio request failed (${response.status}).`);
  // Keep channel layout: stereo pulse (EMDR L/R) must not be downmixed to mono.
  // Mono statement clips still play correctly on a stereo destination.
  return ctx.decodeAudioData(await response.arrayBuffer());
}

// Plays each statement with one pulse.m4a underneath the voice, then a pulse-only gap (two beats
// already in that file) before the next play — including between 2×/4× repeats of the same line.
// The pulse file already contains two beats, so one play = two pulses.
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
  // Master level 0-1. Fade-out ramps to 0; cancelFade / play restore this.
  private volume = 1;
  private repeat = 1;
  private clipIndex = 0;
  private pass = 0;
  private pendingGap = false;
  private nextWhen = 0;
  private schedulerId: ReturnType<typeof setInterval> | null = null;
  private fadeTimer: ReturnType<typeof setTimeout> | null = null;
  private sources = new Set<AudioBufferSourceNode>();
  private envelopes = new Set<GainNode>();
  private loadId = 0;
  private disposed = false;

  private ensureContext(): AudioContext {
    if (this.ctx) return this.ctx;
    const ctx = new (audioContextClass())();
    this.master = ctx.createGain();
    this.master.gain.value = this.volume;
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
    this.pendingGap = false;
    this.ready = this.clips.length > 0 && !!this.pulse;
  }

  // 0 = all instruction, 100 = all pulse (equal-power).
  setBalance(value: number): void {
    this.balance = Math.min(100, Math.max(0, value));
    this.applyMix();
  }

  // Overall level 0-1. Does not change the instruction/pulse blend.
  // During an end fade only the stored level updates; cancelFade restores it to the graph.
  setVolume(value: number): void {
    this.volume = Math.min(1, Math.max(0, value));
    if (this.fadeTimer || !this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(this.volume, now, 0.03);
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
    this.clearSources();
    this.clipIndex = 0;
    this.pass = 0;
    this.pendingGap = false;
    this.nextWhen = 0;
    this.setPlaying(false);
    if (this.ctx?.state === 'running') this.ctx.suspend().catch(() => {});
  }

  fadeOutAndStop(seconds: number): void {
    if (!this.ctx || !this.master || !this.playing) {
      this.stop();
      return;
    }
    // Stop scheduling immediately so silent clips aren't queued under the fade.
    this.stopScheduler();
    const gain = this.master.gain;
    const now = this.ctx.currentTime;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(gain.value, now);
    gain.linearRampToValueAtTime(0, now + seconds);
    this.fadeTimer = setTimeout(() => this.stop(), seconds * 1000);
  }

  // Like fadeOutAndStop, but keeps playlist position so play() continues from the next clip.
  // play() restores the set volume.
  fadeOutAndPause(seconds: number): void {
    if (!this.ctx || !this.master || !this.playing) return;
    // Stop scheduling immediately so silent clips aren't queued under the fade.
    this.stopScheduler();
    const gain = this.master.gain;
    const now = this.ctx.currentTime;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(gain.value, now);
    gain.linearRampToValueAtTime(0, now + seconds);
    this.fadeTimer = setTimeout(() => {
      this.fadeTimer = null;
      // Drop anything already queued so Play doesn't burst previously silent audio.
      this.clearSources();
      if (this.ctx) this.nextWhen = this.ctx.currentTime;
      void this.pause();
    }, seconds * 1000);
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
      this.master.gain.value = this.volume;
    }
  }

  private stopScheduler(): void {
    if (this.schedulerId) clearInterval(this.schedulerId);
    this.schedulerId = null;
  }

  private clearSources(): void {
    for (const source of this.sources) {
      try {
        source.stop();
        source.disconnect();
      } catch {
        // Already stopped.
      }
    }
    this.sources.clear();
    for (const env of this.envelopes) {
      try {
        env.disconnect();
      } catch {
        // Already disconnected.
      }
    }
    this.envelopes.clear();
  }

  private advance(): void {
    this.pass = 0;
    this.clipIndex = (this.clipIndex + 1) % Math.max(1, this.clips.length);
    this.pendingGap = true;
  }

  private tick(): void {
    const ctx = this.ctx;
    if (!this.playing || !ctx || !this.ready || !this.pulse) return;
    const pulseDur = this.pulse.duration;
    if (pulseDur <= 0) return;

    while (this.nextWhen < ctx.currentTime + LOOKAHEAD_SEC) {
      if (this.pendingGap) {
        // One pulse.m4a = two beats already; do not play it twice.
        this.startSource(this.pulse, this.pulseGain!, this.nextWhen, pulseDur);
        this.nextWhen += pulseDur;
        this.pendingGap = false;
        continue;
      }

      const clip = this.clips[this.clipIndex];
      const voiceDur = clip.duration;
      if (voiceDur > 0) {
        this.startSource(clip, this.instructionGain!, this.nextWhen, voiceDur);
      }
      // One pulse under the statement, cut off when the voice ends so it doesn't spill into the gap.
      if (voiceDur > 0) {
        this.startSource(this.pulse, this.pulseGain!, this.nextWhen, Math.min(pulseDur, voiceDur));
      } else {
        this.startSource(this.pulse, this.pulseGain!, this.nextWhen, pulseDur);
      }
      this.nextWhen += Math.max(voiceDur, 0);
      this.pass += 1;
      // Gap after every play so 2×/4× are not stacked back-to-back.
      if (this.pass >= this.repeat) this.advance();
      else this.pendingGap = true;
    }
  }

  private startSource(buffer: AudioBuffer, destination: AudioNode, when: number, duration: number): void {
    if (duration <= 0) return;
    const ctx = this.ctx!;
    const source = ctx.createBufferSource();
    const env = ctx.createGain();
    source.buffer = buffer;
    source.connect(env);
    env.connect(destination);

    const fade = Math.min(SOURCE_FADE_SEC, duration / 2);
    const end = when + duration;
    env.gain.setValueAtTime(0, when);
    env.gain.linearRampToValueAtTime(1, when + fade);
    env.gain.setValueAtTime(1, end - fade);
    env.gain.linearRampToValueAtTime(0, end);

    source.start(when, 0, duration);
    this.sources.add(source);
    this.envelopes.add(env);
    source.onended = () => {
      this.sources.delete(source);
      try {
        env.disconnect();
      } catch {
        // Already disconnected.
      }
      this.envelopes.delete(env);
    };
  }
}
