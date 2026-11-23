export const VOICE_FLOOR = 0.15;

/**
 * Map voice share (0–100) to equal-power gains.
 * Fully left (voiceMix=100): background silent, voice full.
 * Fully right (voiceMix=0): background full, voice at VOICE_FLOOR.
 */
export function mixGains(voiceMix: number): { voice: number; background: number } {
  const voiceShare = Math.min(100, Math.max(0, voiceMix)) / 100;
  const t = 1 - voiceShare; // background share 0–1
  const voiceEq = Math.cos(t * Math.PI * 0.5);
  const bgEq = Math.sin(t * Math.PI * 0.5);
  const voice = t <= 0 ? voiceEq : Math.max(voiceEq, VOICE_FLOOR * t);
  return { voice, background: bgEq };
}
