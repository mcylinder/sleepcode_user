'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { HexLogo } from '@/components/ui/icons';

export default function SiteHeader() {
  const { currentUser } = useAuth();

  return (
    <header className="mx-auto flex w-full max-w-[1060px] items-center justify-between px-[26px] pt-[26px] wide:px-[60px] wide:pt-[34px]">
      <Link href="/" className="flex items-center gap-2">
        <HexLogo />
        <span className="sc-eyebrow--muted">SleepCode</span>
      </Link>
      <nav className="flex items-center gap-5 text-[12px] text-fg-muted">
        <Link href="/pricing" className="hover:text-fg">Pricing</Link>
        {currentUser ? (
          <Link href="/application" className="hover:text-fg">Open SleepCode</Link>
        ) : (
          <Link href="/login" className="hover:text-fg">Log in</Link>
        )}
      </nav>
    </header>
  );
}
