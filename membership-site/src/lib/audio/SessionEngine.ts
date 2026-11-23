import { mixGains } from './mix';
import type { PlayPlan } from './playPlan';
import {
  createPulseWidthNode,
  DEFAULT_PULSE_WIDTH,
  normalizePulseWidth,
  type PulseWidth,
  type PulseWidthNode,
} from './pulseWidth';
import { snapToBeat, SPACING_OFF_GAP_SEC, trimmedDuration } from './spacing';

const LOOKAHEAD_SEC = 0.2;
const SCHEDULE_INTERVAL_MS = 50;
const LOAD_CONCURRENCY = 6;
const SOURCE_FADE_SEC = 0.012;
const BG_CROSSFADE_SEC = 1;

function audioContextClass(): typeof AudioContext {
  const legacy = (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  return window.AudioContext ?? legacy;
}

async function decodeUrl(ctx: BaseAudioContext, url: string): Promise<AudioBuffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Audio request failed (${response.status}).`);
  return ctx.decodeAudioData(await response.arrayBuffer());
}

type BackgroundMode = 'pulse' | 'loop';

/**
 * Voice clips over a background: Pulse (per-statement underlay + gap) or a looping
 * Nature/Music buffer. Mix controls voice vs background gains with a voice floor.
 */
export class SessionEngine {
  playing = false;
  ready = false;
  onPlayingChange: ((playing: boolean) => void) | null = null;

  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private instructionGain: GainNode | null = null;
  private bgMixGain: GainNode | null = null;
  private pulseWidthNode: PulseWidthNode | null = null;
  private pulseWidth: PulseWidth = DEFAULT_PULSE_WIDTH;
  private clips: AudioBuffer[] = [];
  private pulse: AudioBuffer | null = null;
  /** Voice share 0–100 (default 75). */
  private voiceMix = 75;
  private volume = 1;
  private repeat = 1;
  private spacingOn = true;
  private backgroundMode: BackgroundMode = 'pulse';
  private loopBuffer: AudioBuffer | null = null;
  private loopBpm: number | null = null;
  private loopSource: AudioBufferSourceNode | null = null;
  private loopEnv: GainNode | null = null;
  private beatOrigin = 0;
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
    this.bgMixGain = ctx.createGain();
    this.pulseWidthNode = createPulseWidthNode(ctx, this.pulseWidth);
    this.instructionGain.connect(this.master);
    this.pulseWidthNode.output.connect(this.bgMixGain);
    this.bgMixGain.connect(this.master);
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

  /** @deprecated Prefer setVoiceMix. balance 0 = all voice, 100 = all background. */
  setBalance(value: number): void {
    this.setVoiceMix(100 - Math.min(100, Math.max(0, value)));
  }

  setVoiceMix(voiceMix: number): void {
    this.voiceMix = Math.min(100, Math.max(0, voiceMix));
    this.applyMix();
  }

  setPulseWidth(value: PulseWidth): void {
    this.pulseWidth = normalizePulseWidth(value);
    this.pulseWidthNode?.setWidth(this.pulseWidth);
  }

  setVolume(value: number): void {
    this.volume = Math.min(1, Math.max(0, value));
    if (this.fadeTimer || !this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(this.volume, now, 0.03);
  }

  setRepeat(count: number): void {
    this.repeat = Math.max(1, Math.round(count));
    if (this.pass >= this.repeat) this.advance();
  }

  setSpacing(on: boolean): void {
    this.spacingOn = on;
  }

  /** Restore session pulse as the background (stops any Nature/Music loop). */
  usePulseBackground(): void {
    this.stopLoop(0.05);
    this.backgroundMode = 'pulse';
    this.loopBuffer = null;
    this.loopBpm = null;
  }

  /**
   * Decode-ready Nature/Music buffer as the looping background. Crossfades ~1s from
   * the previous loop (or from silence). Pulse underlay is disabled while active.
   */
  setBackgroundBuffer(buffer: AudioBuffer | null, opts?: { bpm?: number }): void {
    this.ensureContext();
    if (!buffer) {
      this.usePulseBackground();
      return;
    }
    this.backgroundMode = 'loop';
    this.loopBuffer = buffer;
    this.loopBpm = typeof opts?.bpm === 'number' && opts.bpm > 0 ? opts.bpm : null;
    this.startLoop(BG_CROSSFADE_SEC);
  }

  async play(): Promise<void> {
    if (!this.ready) return;
    const ctx = this.ensureContext();
    this.cancelFade();
    if (ctx.state !== 'running') await ctx.resume();
    if (this.playing) return;
    if (this.nextWhen < ctx.currentTime + 0.05) this.nextWhen = ctx.currentTime + 0.05;
    if (this.backgroundMode === 'loop' && this.loopBuffer && !this.loopSource) {
      this.startLoop(0.05);
    }
    if (this.backgroundMode === 'loop' && this.loopBpm) {
      this.beatOrigin = this.nextWhen;
    }
    this.setPlaying(true);
    this.tick();
    this.schedulerId = setInterval(() => this.tick(), SCHEDULE_INTERVAL_MS);
  }

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
    this.stopLoop(0);
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
    this.stopScheduler();
    const gain = this.master.gain;
    const now = this.ctx.currentTime;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(gain.value, now);
    gain.linearRampToValueAtTime(0, now + seconds);
    this.fadeTimer = setTimeout(() => this.stop(), seconds * 1000);
  }

  fadeOutAndPause(seconds: number): void {
    if (!this.ctx || !this.master || !this.playing) return;
    this.stopScheduler();
    const gain = this.master.gain;
    const now = this.ctx.currentTime;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(gain.value, now);
    gain.linearRampToValueAtTime(0, now + seconds);
    this.fadeTimer = setTimeout(() => {
      this.fadeTimer = null;
      this.clearSources();
      this.stopLoop(0);
      if (this.ctx) this.nextWhen = this.ctx.currentTime;
      void this.pause();
    }, seconds * 1000);
  }

  resumeIfPlaying(): void {
    if (this.playing && this.ctx && this.ctx.state !== 'running') this.ctx.resume().catch(() => {});
  }

  get pulseBeatSeconds(): number | null {
    if (!this.pulse || this.pulse.duration <= 0) return null;
    return this.pulse.duration / 2;
  }

  /** Duck background mix temporarily (e.g. while previewing). Returns restore fn. */
  duckBackground(factor = 0.15): () => void {
    if (!this.ctx || !this.bgMixGain) return () => {};
    const gain = this.bgMixGain.gain;
    const now = this.ctx.currentTime;
    const previous = gain.value;
    gain.cancelScheduledValues(now);
    gain.setTargetAtTime(previous * factor, now, 0.05);
    return () => {
      if (!this.ctx || !this.bgMixGain) return;
      const t = this.ctx.currentTime;
      this.bgMixGain.gain.cancelScheduledValues(t);
      this.applyMix();
    };
  }

  dispose(): void {
    this.disposed = true;
    this.loadId += 1;
    this.stop();
    this.pulseWidthNode?.dispose();
    this.pulseWidthNode = null;
    this.ctx?.close().catch(() => {});
    this.ctx = null;
    this.clips = [];
    this.pulse = null;
    this.loopBuffer = null;
    this.ready = false;
    this.onPlayingChange = null;
  }

  private setPlaying(playing: boolean): void {
    if (this.playing === playing) return;
    this.playing = playing;
    this.onPlayingChange?.(playing);
  }

  private applyMix(immediate = false): void {
    if (!this.ctx || !this.instructionGain || !this.bgMixGain) return;
    const { voice, background } = mixGains(this.voiceMix);
    if (immediate) {
      this.instructionGain.gain.value = voice;
      this.bgMixGain.gain.value = background;
      return;
    }
    const now = this.ctx.currentTime;
    this.instructionGain.gain.setTargetAtTime(voice, now, 0.03);
    this.bgMixGain.gain.setTargetAtTime(background, now, 0.03);
  }

  private startLoop(fadeSec: number): void {
    if (!this.ctx || !this.bgMixGain || !this.loopBuffer) return;
    const ctx = this.ctx;
    const prevEnv = this.loopEnv;
    const prevSource = this.loopSource;
    if (prevEnv && prevSource) {
      const now = ctx.currentTime;
      prevEnv.gain.cancelScheduledValues(now);
      prevEnv.gain.setValueAtTime(prevEnv.gain.value, now);
      prevEnv.gain.linearRampToValueAtTime(0, now + fadeSec);
      const oldSource = prevSource;
      const oldEnv = prevEnv;
      window.setTimeout(() => {
        try {
          oldSource.stop();
          oldSource.disconnect();
          oldEnv.disconnect();
        } catch {
          // Already stopped.
        }
      }, fadeSec * 1000 + 50);
    }

    const source = ctx.createBufferSource();
    const env = ctx.createGain();
    source.buffer = this.loopBuffer;
    source.loop = true;
    source.connect(env);
    env.connect(this.bgMixGain);
    const now = ctx.currentTime;
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(1, now + Math.max(0.05, fadeSec));
    source.start(now);
    this.loopSource = source;
    this.loopEnv = env;
  }

  private stopLoop(fadeSec: number): void {
    const source = this.loopSource;
    const env = this.loopEnv;
    this.loopSource = null;
    this.loopEnv = null;
    if (!source || !env || !this.ctx) return;
    if (fadeSec <= 0) {
      try {
        source.stop();
        source.disconnect();
        env.disconnect();
      } catch {
        // Already stopped.
      }
      return;
    }
    const now = this.ctx.currentTime;
    env.gain.cancelScheduledValues(now);
    env.gain.setValueAtTime(env.gain.value, now);
    env.gain.linearRampToValueAtTime(0, now + fadeSec);
    window.setTimeout(() => {
      try {
        source.stop();
        source.disconnect();
        env.disconnect();
      } catch {
        // Already stopped.
      }
    }, fadeSec * 1000 + 50);
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

  private voiceDestination(): AudioNode {
    return this.instructionGain!;
  }

  private pulseDestination(): AudioNode {
    return this.pulseWidthNode!.input;
  }

  private tick(): void {
    const ctx = this.ctx;
    if (!this.playing || !ctx || !this.ready) return;

    if (this.backgroundMode === 'loop') {
      this.tickLoopMode(ctx);
      return;
    }

    if (!this.pulse) return;
    const pulseDur = this.pulse.duration;
    if (pulseDur <= 0) return;

    while (this.nextWhen < ctx.currentTime + LOOKAHEAD_SEC) {
      if (this.pendingGap) {
        if (this.spacingOn) {
          this.startSource(this.pulse, this.pulseDestination(), this.nextWhen, pulseDur);
          this.nextWhen += pulseDur;
        } else {
          this.nextWhen += SPACING_OFF_GAP_SEC;
        }
        this.pendingGap = false;
        continue;
      }

      const clip = this.clips[this.clipIndex];
      const voiceDur = this.spacingOn ? clip.duration : trimmedDuration(clip);
      if (voiceDur > 0) {
        this.startSource(clip, this.voiceDestination(), this.nextWhen, voiceDur);
      }
      if (this.spacingOn) {
        if (voiceDur > 0) {
          this.startSource(this.pulse, this.pulseDestination(), this.nextWhen, Math.min(pulseDur, voiceDur));
        } else {
          this.startSource(this.pulse, this.pulseDestination(), this.nextWhen, pulseDur);
        }
      }
      this.nextWhen += Math.max(voiceDur, 0);
      this.pass += 1;
      if (this.pass >= this.repeat) this.advance();
      else this.pendingGap = true;
    }
  }

  private tickLoopMode(ctx: AudioContext): void {
    while (this.nextWhen < ctx.currentTime + LOOKAHEAD_SEC) {
      if (this.pendingGap) {
        if (this.spacingOn) {
          // Keep a short fixed gap so repeats aren't stacked (pulse gap file not used).
          this.nextWhen += SPACING_OFF_GAP_SEC * 2;
        } else if (this.loopBpm) {
          this.nextWhen = snapToBeat(this.nextWhen + SPACING_OFF_GAP_SEC, this.beatOrigin, this.loopBpm);
        } else {
          this.nextWhen += SPACING_OFF_GAP_SEC;
        }
        this.pendingGap = false;
        continue;
      }

      const clip = this.clips[this.clipIndex];
      const voiceDur = this.spacingOn ? clip.duration : trimmedDuration(clip);
      let startAt = this.nextWhen;
      if (!this.spacingOn && this.loopBpm) {
        startAt = snapToBeat(startAt, this.beatOrigin, this.loopBpm);
      }
      if (voiceDur > 0) {
        this.startSource(clip, this.voiceDestination(), startAt, voiceDur);
      }
      this.nextWhen = startAt + Math.max(voiceDur, 0);
      this.pass += 1;
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
