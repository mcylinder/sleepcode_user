'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import { ChevronRight } from '@/components/ui/icons';
import { useMainNav } from '@/lib/useMainNav';

const PANEL_ID = 'site-menu';

// Same destinations as the app rail and tab bar (see useMainNav). Journal stays out until real posts exist.
export default function SiteHeader() {
  const pathname = usePathname();
  const nav = useMainNav();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const library = nav[0];

  return (
    <header className="relative">
      <div className="sc-px flex items-center justify-between gap-4 py-[22px]">
        <Logo />
        <nav className="hidden items-center gap-[26px] text-[15px] text-ink-muted md:flex" aria-label="Main">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              aria-current={item.active ? 'page' : undefined}
              className={item.active ? 'font-semibold text-accent' : 'hover:text-ink'}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-5 text-[15px] md:hidden">
          {!library.active && (
            <Link href={library.href} className="font-medium text-ink">
              {library.label}
            </Link>
          )}
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
          aria-label="Main"
          className="absolute inset-x-0 top-full z-20 border-b border-hairline bg-bg pb-4 shadow-[0_18px_30px_-24px_rgba(0,0,0,0.6)] md:hidden"
        >
          <ul className="sc-px">
            {nav.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={item.active ? 'page' : undefined}
                  className={`sc-row sc-row--between min-h-[52px] text-[17px] font-medium ${
                    item.active ? 'text-accent' : 'text-ink'
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
