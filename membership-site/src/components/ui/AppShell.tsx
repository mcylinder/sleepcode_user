'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Logo from './Logo';

type Tab = 'library' | 'account';

// Desktop: a 200px rail on the left. Mobile: the logo on top and a sticky tab bar at the bottom.
// Signed out: Library + Sign in (account is only for saving settings).
export default function AppShell({
  active,
  maxWidth = 860,
  children,
}: {
  active: Tab;
  maxWidth?: number;
  children: React.ReactNode;
}) {
  const { currentUser } = useAuth();
  const tabs = currentUser
    ? [
        { id: 'library' as const, label: 'Library', href: '/application' },
        { id: 'account' as const, label: 'Account', href: '/account' },
      ]
    : [
        { id: 'library' as const, label: 'Library', href: '/application' },
        { id: 'account' as const, label: 'Sign in', href: '/login?next=/application' },
      ];

  const link = (tab: (typeof tabs)[number], className: string) => {
    const isActive = tab.id === active && !!currentUser;
    return (
      <Link
        key={tab.href}
        href={tab.href}
        aria-current={isActive ? 'page' : undefined}
        className={`${className} ${isActive ? 'font-semibold text-accent' : ''}`}
      >
        {tab.label}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col">
      <div className="flex flex-1">
        <aside className="sticky top-0 hidden h-screen w-[200px] flex-none flex-col gap-[30px] border-r border-hairline px-6 py-7 wide:flex">
          <Logo href="/" compact />
          <nav className="flex flex-col gap-4 text-[15px] text-ink-muted" aria-label="Main">
            {tabs.map((tab) => link(tab, ''))}
          </nav>
        </aside>
        <main className="flex min-w-0 flex-1 flex-col px-[clamp(22px,4vw,56px)] py-[clamp(26px,4vw,56px)]">
          <div className="mb-[26px] wide:hidden">
            <Logo href="/" compact />
          </div>
          <div className="flex w-full flex-col" style={{ maxWidth }}>
            {children}
          </div>
        </main>
      </div>
      <nav
        className="sticky bottom-0 z-10 flex justify-around border-t border-hairline bg-bg-alt pb-[env(safe-area-inset-bottom,0px)] text-[12px] font-medium text-ink-muted wide:hidden"
        aria-label="Main"
      >
        {tabs.map((tab) => link(tab, 'flex min-h-[44px] flex-1 items-center justify-center pb-[14px] pt-3'))}
      </nav>
    </div>
  );
}
