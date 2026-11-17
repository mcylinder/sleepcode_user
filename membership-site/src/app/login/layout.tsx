import type { Metadata } from 'next';
import { pageMeta } from '@/lib/site';

export const metadata: Metadata = pageMeta(
  'Sign in',
  'Sign in or create a free SleepCode account to keep your listening defaults.',
);

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
