import type { Metadata } from 'next';
import { pageMeta } from '@/lib/site';

export const metadata: Metadata = pageMeta(
  'Transcript',
  'Every word spoken in a SleepCode session.',
);

export default function ScriptLayout({ children }: { children: React.ReactNode }) {
  return children;
}
