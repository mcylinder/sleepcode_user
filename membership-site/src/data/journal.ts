export type JournalBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'list'; items: string[] };

export interface JournalPost {
  slug: string;
  date: string; // YYYY-MM-DD
  title: string;
  dek: string;
  byline: string;
  body: JournalBlock[];
}

// Newest first.
export const JOURNAL_POSTS: JournalPost[] = [];

export function findPost(slug: string): JournalPost | null {
  return JOURNAL_POSTS.find((post) => post.slug === slug) ?? null;
}

// 2026-09-18 -> 2026.09.18
export function journalDate(date: string): string {
  return date.replace(/-/g, '.');
}
