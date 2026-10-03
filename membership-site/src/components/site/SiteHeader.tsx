'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/ui/Logo';

// Journal stays out of the nav until real posts exist.
const NAV = [
  { href: '/#how-it-works', label: 'How it works', match: null },
  { href: '/pricing', label: 'Pricing', match: '/pricing' },
  { href: '/faq', label: 'FAQ', match: '/faq' },
];

export default function SiteHeader() {
  const { currentUser } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sc-px flex items-center justify-between gap-4 py-[22px]">
      <Logo />
      <nav className="flex items-center gap-[26px] text-[15px] text-ink-muted" aria-label="Site">
        {NAV.map((item) => {
          const active = item.match !== null && pathname.startsWith(item.match);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`hidden md:inline ${active ? 'font-semibold text-accent' : ''}`}
            >
              {item.label}
            </Link>
          );
        })}
        {currentUser ? (
          <Link href="/application" className="font-medium text-ink">Application</Link>
        ) : (
          <Link href="/login" className="font-medium text-ink">Log in</Link>
        )}
      </nav>
    </header>
  );
}
