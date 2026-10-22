export interface ManifestStatement {
  filename?: string;
  concept_id?: number;
  variant_id?: number;
  // The exact words spoken in this file. Shown on the script page.
  text?: string;
}

export interface ManifestConcept {
  id: number;
  // Optional short label for the concept, shown as a heading on the script page.
  title?: string;
}

export interface SessionManifest {
  statements?: ManifestStatement[];
  concepts?: ManifestConcept[];
  pulse?: { path?: string };
}

export interface ScriptConcept {
  id: number;
  title?: string;
  lines: string[];
}

// Script page: every statement's text, grouped by concept (in concept order), variants in order.
// Returns [] when the manifest has no text yet.
export function buildScript(manifest: SessionManifest): ScriptConcept[] {
  const titles = new Map((manifest.concepts ?? []).map((c) => [c.id, c.title]));
  const byConcept = new Map<number, { variant: number; text: string }[]>();
  for (const statement of manifest.statements ?? []) {
    const ids = conceptVariantOf(statement);
    const text = statement.text?.trim();
    if (!ids || !text) continue;
    const lines = byConcept.get(ids.concept) ?? [];
    lines.push({ variant: ids.variant, text });
    byConcept.set(ids.concept, lines);
  }
  return [...byConcept.entries()]
    .sort(([a], [b]) => a - b)
    .map(([id, lines]) => ({
      id,
      title: titles.get(id),
      lines: lines.sort((a, b) => a.variant - b.variant).map((l) => l.text),
    }));
}

export interface PlayPlan {
  pulseUrl: string;
  statementUrls: string[];
}

function shuffle<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function conceptVariantOf(statement: ManifestStatement): { concept: number; variant: number } | null {
  if (typeof statement.concept_id === 'number' && typeof statement.variant_id === 'number') {
    return { concept: statement.concept_id, variant: statement.variant_id };
  }
  const match = /^c(\d+)_v(\d+)\.m4a$/i.exec(statement.filename ?? '');
  return match ? { concept: Number(match[1]), variant: Number(match[2]) } : null;
}

// Concepts are shuffled once per load. Every concept's v1 plays in that order, then every
// v2 in the same order, and the whole sequence loops. Manifest paths are generator-local,
// so only bare filenames are used.
export function buildPlayPlan(manifest: SessionManifest, fileUrl: (filename: string) => string): PlayPlan {
  const byConcept = new Map<number, Map<number, string>>();
  for (const statement of manifest.statements ?? []) {
    const ids = conceptVariantOf(statement);
    if (!statement.filename || !ids) continue;
    const variants = byConcept.get(ids.concept) ?? new Map<number, string>();
    variants.set(ids.variant, statement.filename);
    byConcept.set(ids.concept, variants);
  }

  const order = shuffle([...byConcept.keys()]);
  const variantIds = Array.from(new Set([...byConcept.values()].flatMap((v) => [...v.keys()]))).sort((a, b) => a - b);
  const filenames = variantIds.flatMap((variant) =>
    order.map((concept) => byConcept.get(concept)?.get(variant)).filter((name): name is string => !!name),
  );

  const pulsePath = manifest.pulse?.path;
  const pulseName = pulsePath?.endsWith('.m4a') ? pulsePath.split('/').pop()! : 'pulse.m4a';

  return { pulseUrl: fileUrl(pulseName), statementUrls: filenames.map(fileUrl) };
}
