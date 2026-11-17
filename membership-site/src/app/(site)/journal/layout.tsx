import type { Metadata } from 'next';
import { pageMeta } from '@/lib/site';

// Hidden until there are enough posts to link from the nav.
export const metadata: Metadata = {
  ...pageMeta('Journal', 'Notes on SleepCode, listening, and how the sessions are made.'),
  robots: { index: false, follow: false },
};

export default function JournalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
