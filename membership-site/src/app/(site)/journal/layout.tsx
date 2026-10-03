import type { Metadata } from 'next';

// Hidden until there are enough posts to link from the nav.
export const metadata: Metadata = {
  title: 'Journal \u2014 SleepCode',
  robots: { index: false, follow: false },
};

export default function JournalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
