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
export const JOURNAL_POSTS: JournalPost[] = [
  {
    slug: 'why-we-say-every-word-out-loud',
    date: '2026-09-18',
    title: 'Why we say every word out loud',
    dek: 'On choosing supraliminal over subliminal, and what first-person repetition is for.',
    byline: 'By the founder',
    body: [
      {
        type: 'p',
        text: 'When we started building SleepCode, the first decision was the easiest one. Nothing would be hidden. If a session says something, you hear it, clearly, at a normal speaking volume.',
      },
      {
        type: 'p',
        text: 'Subliminal audio asks you to trust messages you can\u2019t check. We wanted the opposite: something you can listen to, judge for yourself, and stop using the moment it doesn\u2019t feel right.',
      },
      { type: 'h2', text: 'Why the first person' },
      {
        type: 'p',
        text: 'Every line is spoken as \u201cI\u201d. Not \u201cyou will\u201d or \u201cyou are\u201d, but \u201cI finish what I start.\u201d It sounds less like being told and more like hearing your own thinking, said the way you\u2019d like it to go.',
      },
      { type: 'quote', text: 'The goal isn\u2019t to be convinced. It\u2019s to make a better thought familiar.' },
      { type: 'h2', text: 'How we write a session' },
      {
        type: 'list',
        items: [
          'One goal per session, stated in plain words.',
          'Short sentences you could actually say to yourself.',
          'A slow pulse underneath, never louder than the words.',
        ],
      },
      {
        type: 'p',
        text: 'That\u2019s all there is to it. Choose a goal, listen daily, and decide for yourself whether it helps.',
      },
    ],
  },
];

export function findPost(slug: string): JournalPost | null {
  return JOURNAL_POSTS.find((post) => post.slug === slug) ?? null;
}

// 2026-09-18 -> 2026.09.18
export function journalDate(date: string): string {
  return date.replace(/-/g, '.');
}
