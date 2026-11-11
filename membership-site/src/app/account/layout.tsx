import type { Metadata } from 'next';
import { pageMeta } from '@/lib/site';

export const metadata: Metadata = pageMeta(
  'Account',
  'Membership, listening defaults, and account settings for SleepCode.',
);

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
