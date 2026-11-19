import type { Metadata } from 'next';
import { pageMeta } from '@/lib/site';

export const metadata: Metadata = pageMeta(
  'Library',
  'Browse SleepCode sessions and pick a goal to listen to.',
);

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
