/** End offset (seconds) after trimming trailing near-silence. */
export function trimmedDuration(buffer: AudioBuffer, threshold = 0.01): number {
  const ch = buffer.getChannelData(0);
  let end = ch.length - 1;
  while (end > 0 && Math.abs(ch[end]) < threshold) end -= 1;
  return Math.max(0, (end + 1) / buffer.sampleRate);
}

/** Next beat boundary at or after `when`, given bpm and an origin time. */
export function snapToBeat(when: number, origin: number, bpm: number): number {
  const beat = 60 / bpm;
  if (beat <= 0) return when;
  const n = Math.ceil((when - origin) / beat - 1e-9);
  return origin + Math.max(0, n) * beat;
}

export const SPACING_OFF_GAP_SEC = 0.3;
