import type { Metadata } from 'next';
import { pageMeta } from '@/lib/site';

export const metadata: Metadata = pageMeta(
  'Contact',
  'Write to SleepCode. A person reads every message.',
);

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
