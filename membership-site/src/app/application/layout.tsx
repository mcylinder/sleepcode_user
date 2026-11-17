import type { Metadata } from 'next';
import { pageMeta } from '@/lib/site';

export const metadata: Metadata = pageMeta(
  'Library',
  'Browse SleepCode sessions and pick a goal to listen to tonight.',
);

export default function ApplicationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
