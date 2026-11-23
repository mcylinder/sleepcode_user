import type { Metadata } from 'next';
import { pageMeta } from '@/lib/site';

export const metadata: Metadata = {
  ...pageMeta('Player', 'Listen to a SleepCode session with voice, pulse, length and repetition controls.'),
  // The player is a tool, not a landing page: keep it out of search results.
  robots: { index: false, follow: true },
};

export default function PlayerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
