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

export function pulseSubhead(): string {
  return data.pulse.subhead;
}

export const PULSE_WIDTH_CARDS = data.pulse.widths;
