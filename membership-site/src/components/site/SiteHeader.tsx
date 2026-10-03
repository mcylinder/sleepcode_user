'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/ui/Logo';
import { ChevronRight } from '@/components/ui/icons';

// Every nav item is a page. Journal stays out of the nav until real posts exist.
const NAV = [
  { href: '/how-to-listen', label: 'How it works' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/faq', label: 'FAQ' },
];

const PANEL_ID = 'site-menu';

export default function SiteHeader() {
  const { currentUser } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const account = currentUser
    ? [
        { href: '/application', label: 'Library' },
        { href: '/account', label: 'Account' },
      ]
    : [{ href: '/login', label: 'Log in' }];

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header className="relative">
      <div className="sc-px flex items-center justify-between gap-4 py-[22px]">
        <Logo />
        <nav className="hidden items-center gap-[26px] text-[15px] text-ink-muted md:flex" aria-label="Site">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={isActive(item.href) ? 'font-semibold text-accent' : ''}
            >
              {item.label}
            </Link>
          ))}
          {account.map((item) => (
            <Link key={item.href} href={item.href} className="font-medium text-ink">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-5 text-[15px] md:hidden">
          <Link href={account[0].href} className="font-medium text-ink">
            {account[0].label}
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls={PANEL_ID}
            className="flex min-h-[44px] items-center gap-2 rounded-full border border-hairline-strong px-4 font-medium text-ink"
          >
            <span aria-hidden="true" className="flex w-[14px] flex-col gap-[4px]">
              <span className={`h-[1.5px] bg-current transition-transform ${menuOpen ? 'translate-y-[2.75px] rotate-45' : ''}`} />
              <span className={`h-[1.5px] bg-current transition-transform ${menuOpen ? '-translate-y-[2.75px] -rotate-45' : ''}`} />
            </span>
            {menuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id={PANEL_ID}
          aria-label="Site"
          className="absolute inset-x-0 top-full z-20 border-b border-hairline bg-bg pb-4 shadow-[0_18px_30px_-24px_rgba(44,38,32,0.45)] md:hidden"
        >
          <ul className="sc-px">
            {[...NAV, ...account.slice(1)].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={`sc-row sc-row--between min-h-[52px] text-[17px] font-medium ${
                    isActive(item.href) ? 'text-accent' : 'text-ink'
                  }`}
                >
                  {item.label}
                  <ChevronRight className="text-ink-muted" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
