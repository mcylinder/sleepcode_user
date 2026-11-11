import type { Metadata } from 'next';
import { pageMeta } from '@/lib/site';

export const metadata: Metadata = pageMeta(
  'Player',
  'Listen to a SleepCode session with voice, pulse, length and repeat controls.',
);

export default function PlayerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
